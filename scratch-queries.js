require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const queries = [
    { name: "SELECT COUNT(*) FROM processed_claims;", sql: "SELECT COUNT(*) FROM processed_claims;" },
    { name: "SELECT COUNT(*) FROM claims;", sql: "SELECT COUNT(*) FROM claims;" },
    { name: "SELECT COUNT(*) FROM processed_claims JOIN claims USING(claim_id);", sql: "SELECT COUNT(*) FROM processed_claims JOIN claims USING(claim_id);" }
  ];

  for (const q of queries) {
    console.log(`\n--- Running Query: ${q.name} ---`);
    const { data, error } = await supabase.rpc('exec_sql', { sql: q.sql });
    if (error) {
      console.error(`Error:`, error);
    } else {
      console.log(`Result:`, data);
    }
  }
}

run();
