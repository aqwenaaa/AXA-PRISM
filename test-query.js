require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function test() {
  console.log("Checking profiles count...");
  const { data: p, error: pe } = await supabase.from('profiles').select('*').limit(5);
  console.log("Profiles Error:", pe);
  console.log("Profiles Data:", p);

  console.log("Checking claims count...");
  const { data: c, error: ce } = await supabase.from('claims').select('*').limit(5);
  console.log("Claims Error:", ce);
  console.log("Claims Data:", c);

  console.log("Checking processed_claims count...");
  const { data: pc, error: pce } = await supabase.from('processed_claims').select('*').limit(5);
  console.log("Processed Claims Error:", pce);
  console.log("Processed Claims Data:", pc);

  console.log("Checking ai_analysis_results count...");
  const { data: ai, error: aie } = await supabase.from('ai_analysis_results').select('*').limit(5);
  console.log("ai_analysis_results Error:", aie);
  console.log("ai_analysis_results Data:", ai);
}

test();
