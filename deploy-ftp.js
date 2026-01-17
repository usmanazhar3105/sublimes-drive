#!/usr/bin/env node

/**
 * FTP Deployment Script for app.sublimesdrive.com
 * 
 * Usage:
 *   npm run deploy
 * 
 * Requires:
 *   - Built project in 'build' directory
 */

import { Client as FTPClient } from 'basic-ftp';
import { readFileSync, existsSync } from 'fs';
import { join, relative, dirname } from 'path';
import { readdir } from 'fs/promises';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Try to load from config file as fallback
let configFromFile = {};
if (existsSync('./deploy-config.json')) {
  try {
    const configData = readFileSync('./deploy-config.json', 'utf-8');
    const parsed = JSON.parse(configData);
    configFromFile = parsed.sftp || parsed; // Support both formats
  } catch (err) {
    console.warn('Could not load deploy-config.json, using environment variables');
  }
}

const config = {
  host: process.env.SFTP_HOST || configFromFile.host || 'ftp.sublimesdrive.com',
  username: process.env.SFTP_USERNAME || configFromFile.username || 'u827579338.appsublimesdrive',
  password: process.env.SFTP_PASSWORD || configFromFile.password || '',
  port: parseInt(process.env.SFTP_PORT || configFromFile.port || '21'),
  remotePath: process.env.SFTP_REMOTE_PATH || configFromFile.remotePath || '/public_html/app',
  localPath: './dist',
};

// Validate credentials
if (!config.password) {
  console.error('❌ Error: SFTP_PASSWORD not found');
  console.error('Please set SFTP_PASSWORD in .env file or deploy-config.json');
  process.exit(1);
}

// Validate build directory exists
if (!existsSync(config.localPath)) {
  console.error(`❌ Error: Build directory '${config.localPath}' not found`);
  console.error('Please run "npm run build" first');
  process.exit(1);
}

/**
 * Recursively get all files in a directory
 */
async function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllFiles(fullPath, baseDir)));
    } else {
      const relativePath = relative(baseDir, fullPath);
      files.push({
        localPath: fullPath,
        remotePath: relativePath.replace(/\\/g, '/'), // Normalize path separators
      });
    }
  }

  return files;
}

/**
 * Upload files to FTP server
 */
async function deploy() {
  console.log('🚀 Starting deployment to app.sublimesdrive.com...\n');

  const client = new FTPClient();

  try {
    // Connect to FTP server
    console.log(`📡 Connecting to ${config.host}:${config.port}...`);
    console.log(`   Username: ${config.username}`);
    console.log(`   Trying FTP (plain)...`);
    
    // Try different connection methods
    let connected = false;
    const connectionAttempts = [
      { secure: false, passive: true, description: 'FTP (plain, passive)' },
      { secure: false, passive: false, description: 'FTP (plain, active)' },
      { secure: true, passive: true, description: 'FTPS (secure, passive)' },
      { secure: 'implicit', passive: true, description: 'FTPS (implicit, passive)' },
    ];

    for (const attempt of connectionAttempts) {
      try {
        console.log(`   Trying ${attempt.description}...`);
        await client.access({
          host: config.host,
          user: config.username,
          password: config.password,
          port: config.port,
          secure: attempt.secure,
          passive: attempt.passive,
          secureOptions: attempt.secure ? { rejectUnauthorized: false } : undefined,
        });
        connected = true;
        console.log(`   ✅ Connected using ${attempt.description}`);
        break;
      } catch (ftpError) {
        if (ftpError.message.includes('530') || ftpError.message.includes('Login') || ftpError.message.includes('Authentication')) {
          // Authentication error - don't try other methods
          throw new Error(`Authentication failed: ${ftpError.message}`);
        }
        // Continue to next attempt for other errors
        console.log(`   ❌ ${attempt.description} failed: ${ftpError.message}`);
      }
    }

    if (!connected) {
      throw new Error('All connection attempts failed');
    }
    
    console.log('✅ Connected successfully!\n');

    // Get all files to upload
    console.log('📦 Scanning build directory...');
    const files = await getAllFiles(config.localPath);
    console.log(`   Found ${files.length} files to upload\n`);

    // Change to remote directory
    console.log(`📁 Changing to remote directory: ${config.remotePath}`);
    try {
      await client.ensureDir(config.remotePath);
    } catch (err) {
      console.warn(`   Warning: Could not ensure directory exists: ${err.message}`);
    }
    console.log('✅ Remote directory ready\n');

    // Upload files
    let uploaded = 0;
    let failed = 0;

    for (const file of files) {
      try {
        const remoteFilePath = `${config.remotePath}/${file.remotePath}`;
        const remoteDir = dirname(remoteFilePath);

        // Ensure remote directory exists
        if (remoteDir !== '.' && remoteDir !== config.remotePath) {
          try {
            await client.ensureDir(remoteDir);
          } catch (err) {
            // Directory might already exist
          }
        }

        // Upload file
        await client.uploadFrom(file.localPath, remoteFilePath);
        uploaded++;
        process.stdout.write(`\r   Uploading: ${uploaded}/${files.length} files`);
      } catch (err) {
        console.error(`\n❌ Failed to upload ${file.remotePath}: ${err.message}`);
        failed++;
      }
    }

    console.log(`\n\n✅ Deployment complete!`);
    console.log(`   Uploaded: ${uploaded} files`);
    if (failed > 0) {
      console.log(`   Failed: ${failed} files`);
    }
    console.log(`\n🌐 Your app should be live at: https://app.sublimesdrive.com`);

  } catch (err) {
    console.error('\n❌ Deployment failed:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('   Connection refused. Please check:');
      console.error('   - FTP host and port are correct');
      console.error('   - Your firewall allows the connection');
    } else if (err.code === 'ENOTFOUND') {
      console.error('   Host not found. Please check SFTP_HOST in config');
    } else if (err.message.includes('Authentication') || err.message.includes('530')) {
      console.error('   Authentication failed. Please check:');
      console.error('   - FTP_USERNAME is correct (current: ' + config.username + ')');
      console.error('   - FTP_PASSWORD is correct');
      console.error('   - No extra spaces in credentials');
      console.error('   - Special characters in password are correct');
      console.error('\n💡 Tip: Verify credentials in Hostinger control panel');
      console.error('   Sometimes the username format is: username@domain.com');
    } else if (err.message.includes('timeout')) {
      console.error('   Connection timeout. Please check:');
      console.error('   - FTP server is accessible');
      console.error('   - Port is correct (21 for FTP)');
      console.error('   - Firewall settings');
    }
    process.exit(1);
  } finally {
    client.close();
  }
}

// Run deployment
deploy().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

