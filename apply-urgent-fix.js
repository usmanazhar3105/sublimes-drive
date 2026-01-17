#!/usr/bin/env node

// Urgent fix: Apply SQL to allow image-only posts
const fs = require('fs');
const https = require('https');

// Do not hardcode credentials in the repo. Provide these via env vars if you ever automate calls.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co';
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

console.log('✅ Frontend fix already applied in CreatePostModal_Full.tsx');
console.log('✅ Content will default to "[Image Post]" when empty');
console.log('');
console.log('📋 To complete the fix, run this SQL in Supabase SQL Editor:');
console.log('');
console.log('─'.repeat(80));
const sql = fs.readFileSync('./URGENT_FIX_IMAGE_POSTS.sql', 'utf8');
console.log(sql);
console.log('─'.repeat(80));
console.log('');
console.log('🌐 Supabase SQL Editor: ' + SUPABASE_URL + '/project/YOUR_PROJECT_ID/sql');
console.log('');
console.log('After running the SQL, try creating a post with just an image - it should work!');

