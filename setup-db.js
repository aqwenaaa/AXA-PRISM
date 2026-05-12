require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.log('❌ Environment variables not configured');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up AXA-PRISM database schema...\n');

    // Read schema file
    const schemaSQL = fs.readFileSync('database-schema.sql', 'utf8');

    // Split SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📄 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim() === '') continue;

      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);

        // Use rpc to execute raw SQL
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });

        if (error) {
          console.log(`❌ Statement ${i + 1} failed:`, error.message);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.log(`❌ Statement ${i + 1} error:`, err.message);
      }
    }

    console.log('\n🔍 Verifying setup...\n');

    // Verify tables exist
    const tablesToCheck = ['profiles', 'claims', 'policies', 'data_ingestion_logs', 'ai_analysis_results', 'audit_feedback'];

    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error && error.code !== 'PGRST116') {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: OK`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`);
      }
    }

    console.log('\n🎉 Database setup completed!');
    console.log('📝 Next steps:');
    console.log('1. Create user accounts in Supabase Auth');
    console.log('2. Assign roles to users via profiles table');
    console.log('3. Import sample data for testing');

  } catch (error) {
    console.log('❌ Database setup failed:', error.message);
  }
}

setupDatabase();