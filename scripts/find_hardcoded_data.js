#!/usr/bin/env node
/**
 * Script to find hardcoded/mock data in components
 * Usage: node scripts/find_hardcoded_data.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '../src');
const findings = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const relativePath = path.relative(srcDir, filePath);
  
  // Patterns to detect mock/hardcoded data
  const patterns = [
    {
      name: 'mock_data_array',
      regex: /const\s+\w+\s*=\s*\[[\s\S]{50,}?\]/g,
      description: 'Large array that might be mock data'
    },
    {
      name: 'mock_listings',
      regex: /mockListings|mock.*listing/i,
      description: 'Mock listing data'
    },
    {
      name: 'mock_users',
      regex: /mockUsers|mock.*user/i,
      description: 'Mock user data'
    },
    {
      name: 'mock_events',
      regex: /mockEvents|mock.*event/i,
      description: 'Mock event data'
    },
    {
      name: 'hardcoded_id',
      regex: /id:\s*['"]\d+['"]|id:\s*\d+/,
      description: 'Hardcoded ID (likely mock data)'
    },
    {
      name: 'todo_replace',
      regex: /TODO.*replace|TODO.*supabase|TODO.*database/i,
      description: 'TODO comment indicating mock data'
    },
    {
      name: 'sample_data',
      regex: /sample|dummy|fake|test.*data/i,
      description: 'Sample/dummy/test data'
    }
  ];
  
  patterns.forEach((pattern, index) => {
    const matches = content.match(pattern.regex);
    if (matches && matches.length > 0) {
      matches.forEach(match => {
        const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
        findings.push({
          file: relativePath,
          line: lineNumber,
          type: pattern.name,
          description: pattern.description,
          snippet: match.substring(0, 100) + (match.length > 100 ? '...' : '')
        });
      });
    }
  });
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and other build directories
      if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      scanFile(fullPath);
    }
  }
}

console.log('🔍 Scanning for hardcoded/mock data...\n');
scanDirectory(srcDir);

// Group findings by file
const byFile = {};
findings.forEach(finding => {
  if (!byFile[finding.file]) {
    byFile[finding.file] = [];
  }
  byFile[finding.file].push(finding);
});

// Output results
console.log(`Found ${findings.length} potential issues across ${Object.keys(byFile).length} files\n`);

Object.keys(byFile).sort().forEach(file => {
  console.log(`\n📄 ${file}`);
  byFile[file].forEach(finding => {
    console.log(`  Line ${finding.line}: ${finding.description}`);
    console.log(`    ${finding.snippet}`);
  });
});

// Save to JSON
const outputPath = path.join(__dirname, '../hardcoded_data_audit.json');
fs.writeFileSync(outputPath, JSON.stringify({ findings, byFile }, null, 2));
console.log(`\n✅ Results saved to ${outputPath}`);

