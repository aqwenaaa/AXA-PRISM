require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.log('❌ Environment variables not configured');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verifySetup() {
  try {
    console.log('🔍 Verifying AXA-PRISM database setup...\n');

    // Check tables
    const tables = ['profiles', 'claims', 'policies', 'data_ingestion_logs', 'ai_analysis_results', 'audit_feedback'];
    let allTablesExist = true;

    for (const tableName of tables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error && error.code !== 'PGRST116') {
          console.log(`❌ ${tableName}: ${error.message}`);
          allTablesExist = false;
        } else {
          console.log(`✅ ${tableName}: OK`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`);
        allTablesExist = false;
      }
    }

    // Check data counts
    console.log('\n📊 Data counts:');
    const dataChecks = [
      { table: 'claims', description: 'Total claims' },
      { table: 'policies', description: 'Total policies' },
      { table: 'ai_analysis_results', description: 'AI analysis results' },
      { table: 'data_ingestion_logs', description: 'Data ingestion logs' }
    ];

    for (const check of dataChecks) {
      try {
        const { count, error } = await supabase
          .from(check.table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`❌ ${check.description}: Error - ${error.message}`);
        } else {
          console.log(`✅ ${check.description}: ${count} records`);
        }
      } catch (err) {
        console.log(`❌ ${check.description}: ${err.message}`);
      }
    }

    // Check auth users
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.log(`❌ Auth users: ${authError.message}`);
      } else {
        console.log(`👥 Auth users: ${authUsers?.users?.length || 0} users`);
      }
    } catch (err) {
      console.log(`❌ Auth users: ${err.message}`);
    }

    console.log('\n' + '='.repeat(50));

    if (allTablesExist) {
      console.log('🎉 Database setup is COMPLETE!');
      console.log('\n📝 Next steps for user migration:');
      console.log('1. Create user accounts in Supabase Auth dashboard');
      console.log('2. Assign roles using the SQL below:');

      console.log('\n-- Update user roles (run in Supabase SQL Editor)');
      console.log(`-- Replace 'user-uuid-here' with actual user IDs from Auth`);
      console.log(`UPDATE public.profiles SET role = 'admin' WHERE id = 'user-uuid-here';`);
      console.log(`UPDATE public.profiles SET role = 'data_operator' WHERE id = 'user-uuid-here';`);
      console.log(`UPDATE public.profiles SET role = 'risk_analyst' WHERE id = 'user-uuid-here';`);
      console.log(`UPDATE public.profiles SET role = 'medical_auditor' WHERE id = 'user-uuid-here';`);
      console.log(`UPDATE public.profiles SET role = 'strategic_manager' WHERE id = 'user-uuid-here';`);

    } else {
      console.log('❌ Database setup is INCOMPLETE!');
      console.log('\n🔧 Please run the database-schema.sql in Supabase SQL Editor first');
    }

  } catch (error) {
    console.log('❌ Verification failed:', error.message);
  }
}

verifySetup();