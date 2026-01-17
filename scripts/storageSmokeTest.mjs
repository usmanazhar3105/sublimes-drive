#!/usr/bin/env node

import 'cross-fetch/polyfill';
import { createClient } from '@supabase/supabase-js';

const REQUIRED_ENVS = {
  community: 'VITE_BUCKET_COMMUNITY',
  offers: 'VITE_BUCKET_OFFERS',
  marketplace: 'VITE_BUCKET_MARKETPLACE',
  events: 'VITE_BUCKET_EVENTS',
  garage: 'VITE_BUCKET_GARAGE',
  bidrepair: 'VITE_BUCKET_BIDREPAIR',
  import: 'VITE_BUCKET_IMPORT',
  profile: 'VITE_BUCKET_PROFILE',
  system: 'VITE_BUCKET_SYSTEM',
};

const PUBLIC_BUCKET_KEYS = new Set(['community', 'offers', 'marketplace', 'events']);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set to run storage smoke test.');
  process.exit(1);
}

const bucketMap = Object.entries(REQUIRED_ENVS).reduce((acc, [key, env]) => {
  const value = process.env[env];
  if (!value) {
    throw new Error(`Missing required environment variable ${env}`);
  }
  acc[key] = value;
  return acc;
}, {});

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
  },
});

async function authenticateIfNeeded() {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  if (!email || !password) {
    console.log('ℹ️  TEST_USER_EMAIL / TEST_USER_PASSWORD not set. Running bucket list as anon user.');
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(`Failed to authenticate test user: ${error.message}`);
  }
  console.log(`✅ Signed in as ${email} for bucket smoke test.`);
}

async function listBucketRoot(bucketName) {
  const { data, error } = await supabase.storage.from(bucketName).list('', { limit: 5 });
  if (error) {
    throw new Error(`Failed to list bucket '${bucketName}': ${error.message}`);
  }
  console.log(`📦 ${bucketName}: ${data?.length ?? 0} objects visible`);
}

async function testPublicRead(bucketName) {
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/__smoke_test__`; // optional known file
  try {
    const response = await fetch(publicUrl, { method: 'GET' });
    console.log(`🌐 Public GET ${bucketName}: HTTP ${response.status}`);
  } catch (err) {
    console.warn(`⚠️  Public GET for ${bucketName} failed: ${err.message}`);
  }
}

async function run() {
  try {
    await authenticateIfNeeded();

    for (const [key, bucketName] of Object.entries(bucketMap)) {
      await listBucketRoot(bucketName);
      if (PUBLIC_BUCKET_KEYS.has(key)) {
        await testPublicRead(bucketName);
      }
    }

    await supabase.auth.signOut().catch(() => undefined);
    console.log('✅ Storage smoke test completed.');
  } catch (err) {
    console.error('❌ Storage smoke test failed:', err.message || err);
    process.exit(1);
  }
}

run();

