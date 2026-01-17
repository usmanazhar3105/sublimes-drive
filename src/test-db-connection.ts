/**
 * Quick database connection test
 * Run this to verify Supabase is connected
 */

import { supabase } from './utils/supabase/client';

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can query the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, display_name')
      .limit(5);
    
    if (error) {
      console.error('❌ Database query failed:', error.message);
      console.error('Error details:', error);
      return false;
    }
    
    console.log('✅ Database connected successfully!');
    console.log(`📊 Found ${data?.length || 0} profiles`);
    if (data && data.length > 0) {
      console.log('Sample data:', data);
    }
    
    // Test 2: Check auth session
    const { data: session } = await supabase.auth.getSession();
    if (session?.session) {
      console.log('✅ User is authenticated:', session.session.user.email);
    } else {
      console.log('⚠️ No active session (user not logged in)');
    }
    
    return true;
  } catch (err) {
    console.error('❌ Connection test failed:', err);
    return false;
  }
}

// Run the test
testConnection();
