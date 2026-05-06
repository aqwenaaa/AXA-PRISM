require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking environment variables...');
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('Service Key:', serviceRoleKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !serviceRoleKey) {
  console.log('❌ Environment variables not configured properly');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkDatabase() {
  try {
    console.log('\n🔍 Checking Supabase database structure...\n');

    // Check auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.log('❌ Auth check error:', authError.message);
    } else {
      console.log('👥 Auth Users:', authUsers?.users?.length || 0, 'users');
    }

    // Check tables using direct query to information_schema
    const { data: infoTables, error: infoError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (infoError) {
      console.log('❌ Error getting tables:', infoError.message);
    } else {
      console.log('📋 Public Tables:', infoTables?.length || 0);
      infoTables?.forEach(table => {
        console.log('  -', table.table_name);
      });
    }

    // Check if claims table exists
    const { data: claims, error: claimsError } = await supabase
      .from('claims')
      .select('*')
      .limit(1);

    if (claimsError && claimsError.code !== 'PGRST116') {
      console.log('❌ Claims table error:', claimsError.message);
    } else {
      console.log('✅ Claims table exists');
    }

    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError && profilesError.code !== 'PGRST116') {
      console.log('❌ Profiles table error:', profilesError.message);
    } else {
      console.log('✅ Profiles table exists');
    }

  } catch (error) {
    console.log('❌ Database check failed:', error.message);
  }
}

checkDatabase();