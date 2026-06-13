require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  // 1. SELECT COUNT(*) FROM processed_claims;
  const { count: countProcessed, error: errProcessed } = await supabase
    .from('processed_claims')
    .select('*', { count: 'exact', head: true });

  console.log('\n--- processed_claims count ---');
  if (errProcessed) console.error(errProcessed);
  else console.log('Count:', countProcessed);

  // 2. SELECT COUNT(*) FROM claims;
  const { count: countClaims, error: errClaims } = await supabase
    .from('claims')
    .select('*', { count: 'exact', head: true });

  console.log('\n--- claims count ---');
  if (errClaims) console.error(errClaims);
  else console.log('Count:', countClaims);

  // 3. SELECT COUNT(*) FROM processed_claims JOIN claims USING(claim_id);
  const { count: countJoin, error: errJoin } = await supabase
    .from('processed_claims')
    .select('claim_id, claims!inner(claim_id)', { count: 'exact', head: true });

  console.log('\n--- joined count ---');
  if (errJoin) console.error(errJoin);
  else console.log('Count:', countJoin);

  // 4. Check system_settings table existence and contents
  const { data: settingsData, error: errSettings } = await supabase
    .from('system_settings')
    .select('*');

  console.log('\n--- system_settings contents ---');
  if (errSettings) console.error(errSettings);
  else {
    console.log('Row count:', settingsData.length);
    console.log('Data:', settingsData);
  }
}

run();
