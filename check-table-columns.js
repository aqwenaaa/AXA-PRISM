require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function inspect() {
  const tables = ['profiles', 'claims', 'policies', 'processed_claims'];
  for (const t of tables) {
    console.log(`\n--- Inspecting Table: ${t} ---`);
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`Error:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`Columns:`, Object.keys(data[0]));
    } else {
      console.log(`No rows found to inspect.`);
    }
  }
}

inspect();
