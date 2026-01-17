#!/usr/bin/env node
const fs = require('fs');
const { Client } = require('pg');

async function run() {
  const [,, dbUrl, ...files] = process.argv;
  if (!dbUrl || files.length === 0) {
    console.error('Usage: node apply_sql.js <DATABASE_URL> <file1.sql> [file2.sql ...]');
    process.exit(2);
  }
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query('BEGIN');
    for (const file of files) {
      const sql = fs.readFileSync(file, 'utf8');
      if (!sql.trim()) continue;
      await client.query(sql);
      console.log(`Applied: ${file}`);
    }
    await client.query('COMMIT');
    console.log('All SQL applied successfully');
  } catch (e) {
    console.error('Error applying SQL:', e.message);
    try { await client.query('ROLLBACK'); } catch {}
    process.exit(1);
  } finally {
    await client.end();
  }
}
run().catch(e => { console.error(e); process.exit(1); });
