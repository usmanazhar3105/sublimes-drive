/**
 * Script to create test users in Supabase Auth
 * Run this with: node scripts/create_test_users.js
 * 
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables from command line or environment
const SUPABASE_URL = process.argv[2] || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.argv[3] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing environment variables');
  console.error('\nUsage:');
  console.error('  node scripts/create_test_users.js <SUPABASE_URL> <SERVICE_ROLE_KEY>');
  console.error('\nOr set environment variables:');
  console.error('  VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  console.error('\nYou can find these in:');
  console.error('  Supabase Dashboard → Project Settings → API');
  console.error('\n⚠️  IMPORTANT: Never commit the SERVICE_ROLE_KEY to git!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  {
    email: 'test1@sublimesdrive.com',
    password: 'Password123!',
    user_metadata: {
      display_name: 'Ahmed Al Mansouri',
      full_name: 'Ahmed Al Mansouri'
    },
    role: 'user'
  },
  {
    email: 'test2@sublimesdrive.com',
    password: 'Password123!',
    user_metadata: {
      display_name: 'Premium Auto Garage',
      full_name: 'Premium Auto Garage'
    },
    role: 'garage_owner'
  },
  {
    email: 'test3@sublimesdrive.com',
    password: 'Password123!',
    user_metadata: {
      display_name: 'Sarah Test User',
      full_name: 'Sarah Test User'
    },
    role: 'user'
  },
  {
    email: 'test4@sublimesdrive.com',
    password: 'Password123!',
    user_metadata: {
      display_name: 'Test User 4',
      full_name: 'Test User 4'
    },
    role: 'user'
  },
  {
    email: 'test5@sublimesdrive.com',
    password: 'Password123!',
    user_metadata: {
      display_name: 'Test User 5',
      full_name: 'Test User 5'
    },
    role: 'user'
  }
];

async function createUsers() {
  console.log('🚀 Starting user creation...\n');

  for (const user of testUsers) {
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === user.email);

      if (existingUser) {
        console.log(`⏭️  User ${user.email} already exists, skipping...`);
        continue;
      }

      // Create user with admin API
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: user.user_metadata
      });

      if (error) {
        console.error(`❌ Failed to create ${user.email}:`, error.message);
        continue;
      }

      console.log(`✅ Created user: ${user.email} (${data.user.id})`);

      // Update profile if it exists
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: user.email,
            display_name: user.user_metadata.display_name,
            full_name: user.user_metadata.full_name,
            role: user.role || 'user'
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.log(`⚠️  Profile update warning for ${user.email}:`, profileError.message);
        } else {
          console.log(`   ✅ Profile updated for ${user.email}`);
        }
      } catch (profileErr) {
        console.log(`⚠️  Could not update profile for ${user.email} (this is okay if trigger handles it)`);
      }

    } catch (err) {
      console.error(`❌ Error creating ${user.email}:`, err.message);
    }
  }

  console.log('\n✅ User creation complete!');
  console.log('\n📝 Test Credentials:');
  testUsers.forEach(user => {
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.password}`);
    console.log('');
  });
}

createUsers().catch(console.error);

