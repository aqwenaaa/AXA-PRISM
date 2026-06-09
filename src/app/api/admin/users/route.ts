import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";

// Helper to initialize service role client
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Helper to check admin role
async function checkAdminAuth() {
  const client = await createServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  const { data: profile, error } = await client
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") {
    return { error: "Forbidden. Admin role required.", status: 403 };
  }

  return { authorized: true };
}

// POST: Create a new user
export async function POST(request: Request) {
  try {
    const authCheck = await checkAdminAuth();
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { name, email, role, password } = await request.json();
    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const adminClient = getAdminClient();

    // 1. Create user in Supabase Auth
    const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name }
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // 2. The trigger public.handle_new_user automatically creates a profile record with 'data_operator' default role.
    // We update that profile record with the correct name and role.
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ full_name: name, role, email })
      .eq("id", authData.user.id);

    if (profileError) {
      // Cleanup auth user on profile insertion failure
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, userId: authData.user.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Update an existing user
export async function PUT(request: Request) {
  try {
    const authCheck = await checkAdminAuth();
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { id, name, role, email, password } = await request.json();
    if (!id || !name || !role || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const adminClient = getAdminClient();

    // 1. Update Profile table
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ full_name: name, role, email })
      .eq("id", id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    // 2. Update Supabase Auth user details
    const updateData: any = {
      email,
      user_metadata: { full_name: name }
    };
    if (password) {
      updateData.password = password;
    }

    const { error: authError } = await adminClient.auth.admin.updateUserById(id, updateData);
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove a user
export async function DELETE(request: Request) {
  try {
    const authCheck = await checkAdminAuth();
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing user ID parameter" }, { status: 400 });
    }

    const adminClient = getAdminClient();

    // Deleting the auth user will cascade and delete the profile due to ON DELETE CASCADE
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(id);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
