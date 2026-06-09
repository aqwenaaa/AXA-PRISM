require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Supabase configuration missing in .env.local");
  process.exit(1);
}

// 1. Initialize Supabase admin client
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runSmokeTests() {
  const tempEmail = `smoke_test_${Math.floor(Math.random() * 100000)}@axa-prism.com`;
  const tempPassword = "SuperSecureSmokePassword123!";
  let tempUserId = null;

  try {
    console.log("🚀 Starting Authentication Smoke Tests...");
    console.log(`Step 1: Creating temporary test user (${tempEmail})...`);

    // Create temp user in auth.users
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: "Auth Smoke Test User" }
    });

    if (createError) throw createError;
    tempUserId = userData.user.id;
    console.log(`✅ Temporary user created successfully with ID: ${tempUserId}`);

    console.log("Step 2: Assigning 'admin' RBAC role inside profiles table...");
    // Give user the admin role to ensure access to all dashboards
    const { error: roleError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', tempUserId);

    if (roleError) throw roleError;
    console.log("✅ Role updated to 'admin' in profiles table.");

    console.log("Step 3: Authenticating temporary user via Supabase Auth...");
    // Sign in to get access token JWT
    const { data: sessionData, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
      email: tempEmail,
      password: tempPassword
    });

    if (loginError) throw loginError;
    const token = sessionData.session.access_token;
    console.log("✅ Successfully logged in. Retrieved access_token JWT.");

    console.log("\n==================================================");
    console.log("Step 4: Executing Authenticated Smoke Tests against FastAPI...");
    console.log(`FastAPI Target Base URL: ${API_BASE_URL}`);
    console.log("==================================================\n");

    const endpoints = [
      "/api/v1/claims",
      "/api/v1/policies",
      "/api/v1/notifications"
    ];

    for (const endpoint of endpoints) {
      console.log(`Testing GET ${endpoint}...`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 200) {
        console.log(`✅ GET ${endpoint} -> 200 OK`);
      } else {
        const text = await response.text();
        console.error(`❌ GET ${endpoint} -> Failed (Status: ${response.status})`);
        console.error(`Detail: ${text}`);
      }
    }

    console.log("\n==================================================");
    console.log("Step 5: Verifying Unauthorized Guard returns 401...");
    console.log("==================================================");
    
    const unauthResponse = await fetch(`${API_BASE_URL}/api/v1/claims`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (unauthResponse.status === 401) {
      console.log("✅ Request without Bearer Token returned 401 Unauthorized as expected.");
    } else {
      console.error(`❌ Request without Bearer Token returned unexpected status: ${unauthResponse.status}`);
    }

  } catch (err) {
    console.error("❌ Smoke test failed due to an error:", err.message);
  } finally {
    if (tempUserId) {
      console.log(`\n🧹 Step 6: Cleaning up. Deleting temporary user ID: ${tempUserId}...`);
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(tempUserId);
      if (deleteError) {
        console.error("❌ Failed to delete temporary test user:", deleteError.message);
      } else {
        console.log("✅ Cleanup complete. Temp user deleted successfully.");
      }
    }
  }
}

runSmokeTests();
