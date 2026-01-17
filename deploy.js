#!/usr/bin/env node

/**
 * SFTP Deployment Script for app.sublimesdrive.com
 * 
 * Usage:
 *   npm run deploy
 * 
 * Requires:
 *   - .env file with SFTP credentials
 *   - Built project in 'build' directory
 */

import sftpClientPkg from 'ssh2-sftp-client';
import { readFileSync, existsSync } from 'fs';
import { join, relative, dirname } from 'path';
import { readdir } from 'fs/promises';
import dotenv from 'dotenv';

// Extract Client from CommonJS module
const Client = sftpClientPkg.default || sftpClientPkg;

// Load environment variables
dotenv.config();

// Try to load from config file as fallback
let configFromFile = {};
if (existsSync('./deploy-config.json')) {
  try {
    const configData = readFileSync('./deploy-config.json', 'utf-8');
    configFromFile = JSON.parse(configData).sftp || {};
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
  console.error('\nExample .env file:');
  console.error('  SFTP_PASSWORD=your_password_here');
  process.exit(1);
}

// Validate build directory exists
if (!existsSync(config.localPath)) {
  console.error(`❌ Error: Build directory '${config.localPath}' not found`);
  console.error('Please run "npm run build" first');
  process.exit(1);
}

const sftp = new Client();

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
 * Upload files to SFTP server
 */
async function deploy() {
  console.log('🚀 Starting deployment to app.sublimesdrive.com...\n');

  try {
    // Connect to SFTP server
    // Try both port 22 (standard SFTP) and port 21 (some servers use SFTP on 21)
    const portsToTry = config.port === 21 ? [22, 21] : [config.port];
    let connected = false;
    
    for (const port of portsToTry) {
      try {
        console.log(`📡 Connecting to ${config.host}:${port} (SFTP)...`);
        await sftp.connect({
          host: config.host,
          username: config.username,
          password: config.password,
          port: port,
        });
        connected = true;
        console.log(`✅ Connected on port ${port}!`);
        break;
      } catch (err) {
        if (err.message.includes('Authentication') || err.message.includes('password')) {
          // Authentication error - don't try other ports
          throw err;
        }
        console.log(`   Port ${port} failed: ${err.message}`);
        if (portsToTry.indexOf(port) < portsToTry.length - 1) {
          console.log(`   Trying next port...`);
        }
      }
    }
    
    if (!connected) {
      throw new Error('Failed to connect on any port');
    }
    console.log('✅ Connected successfully!\n');

    // Get all files to upload
    console.log('📦 Scanning build directory...');
    const files = await getAllFiles(config.localPath);
    console.log(`   Found ${files.length} files to upload\n`);

    // Change to remote directory
    console.log(`📁 Changing to remote directory: ${config.remotePath}`);
    try {
      await sftp.mkdir(config.remotePath, true); // Create if doesn't exist
    } catch (err) {
      // Directory might already exist, that's okay
    }
    await sftp.cwd(config.remotePath);
    console.log('✅ Remote directory ready\n');

    // Upload files
    let uploaded = 0;
    let failed = 0;

    for (const file of files) {
      try {
        const remoteFilePath = `${config.remotePath}/${file.remotePath}`;
        const remoteDir = dirname(remoteFilePath);

        // Ensure remote directory exists
        try {
          await sftp.mkdir(remoteDir, true);
        } catch (err) {
          // Directory might already exist
        }

        // Upload file
        await sftp.put(file.localPath, remoteFilePath);
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
      console.error('   - SFTP host and port are correct');
      console.error('   - Your firewall allows the connection');
    } else if (err.code === 'ENOTFOUND') {
      console.error('   Host not found. Please check SFTP_HOST in .env');
    } else if (err.message.includes('Authentication')) {
      console.error('   Authentication failed. Please check:');
      console.error('   - SFTP_USERNAME is correct');
      console.error('   - SFTP_PASSWORD is correct');
    }
    process.exit(1);
  } finally {
    await sftp.end();
  }
}

// Run deployment
deploy().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

