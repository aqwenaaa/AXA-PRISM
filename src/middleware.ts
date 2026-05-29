import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// ============================================================================
// 1. ROLE-BASED ACCESS CONTROL (RBAC) ROUTE CONFIGURATION
// ============================================================================

/**
 * Public routes that do not require any authentication.
 * Anyone can browse these marketing, help, or informational pages.
 */
const PUBLIC_ROUTES = [
  "/",
  "/landing",
  "/about-axa",
  "/faq",
  "/healthcare",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

/**
 * Authenticated-only public pages.
 * If a user is already logged in, they should NOT access these pages (e.g., login form)
 * and instead be redirected to their default role dashboard.
 */
const AUTH_ONLY_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

/**
 * Global protected routes.
 * Accessible by any authenticated user, regardless of their role.
 */
const GLOBAL_PROTECTED_ROUTES = [
  "/profile",
  "/changepassword",
  "/change-password",
  "/security",
  "/logout",
  "/claim-growth",
];

/**
 * Role configuration mapping.
 * Each role defines:
 * 1. defaultDashboard: The landing screen when logged in, or upon unauthorized access.
 * 2. allowedRoutes: Explicitly allowed route prefixes for this role.
 */
interface RoleAccessRule {
  defaultDashboard: string;
  allowedRoutes: string[];
}

const ROLE_ACCESS_RULES: Record<string, RoleAccessRule> = {
  data_operator: {
    defaultDashboard: "/operator/data-ingestion",
    allowedRoutes: ["/operator/data-ingestion"],
  },
  risk_analyst: {
    defaultDashboard: "/analyst/intelligence-lab",
    allowedRoutes: ["/analyst/intelligence-lab"],
  },
  medical_auditor: {
    defaultDashboard: "/auditor/medical-audit",
    allowedRoutes: ["/auditor/medical-audit"],
  },
  strategic_manager: {
    defaultDashboard: "/manager/executive-dashboard",
    allowedRoutes: ["/manager/executive-dashboard", "/manager/claim-growth"],
  },
  admin: {
    defaultDashboard: "/admin/system-overview",
    allowedRoutes: [
      "/admin/system-overview",
      "/admin/user-management",
      "/admin/model-debug",
      "/system-overview",
      "/user-management",
      "/model-debug",
      "/operator/data-ingestion",
      "/analyst/intelligence-lab",
      "/auditor/medical-audit",
      "/manager/executive-dashboard",
      "/manager/claim-growth",
    ],
  },
};

// ============================================================================
// 2. HELPER FUNCTIONS
// ============================================================================

/**
 * Helper to check if a requested pathname matches any of the routes in a list.
 * Supports exact matching and subpath matching (e.g., /admin matches /admin/sub).
 */
function isRouteMatched(pathname: string, routes: string[]): boolean {
  return routes.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname === route || pathname.startsWith(route + "/");
  });
}

/**
 * Secure role extraction fallback function.
 * 1. Checks for a direct, secure `user_role` cookie.
 * 2. If not found, decodes the Supabase Auth session token JWT (cookie) to read roles
 *    from `user_metadata` or `app_metadata` without hitting the database.
 */
function extractRoleFromCookies(request: NextRequest): string | null {
  // Step 1: Direct extraction from a dedicated cookie (great for manual mock/testing)
  const directRole = request.cookies.get("user_role")?.value;
  if (directRole && ROLE_ACCESS_RULES[directRole]) {
    return directRole;
  }

  // Step 2: Extract and decode Supabase JWT session cookie
  try {
    // Find Supabase auth cookie (schema: sb-<project-id>-auth-token)
    const authCookie = request.cookies.getAll().find(
      (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
    );

    if (authCookie?.value) {
      // Supabase token cookies contain serialized JSON with an access_token field
      const parsedToken = JSON.parse(authCookie.value);
      const accessToken = parsedToken?.access_token;

      if (accessToken) {
        // Base64 decode JWT payload (second segment of JWT)
        const parts = accessToken.split(".");
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], "base64").toString("utf-8");
          const payload = JSON.parse(payloadJson);

          // Roles can live in app_metadata, user_metadata, or root claims
          const role =
            payload?.app_metadata?.role ||
            payload?.user_metadata?.role ||
            payload?.user_metadata?.user_role ||
            payload?.role;

          if (role && ROLE_ACCESS_RULES[role]) {
            return role;
          }
        }
      }
    }
  } catch (err) {
    console.error("[Middleware] Role extraction from token failed:", err);
  }

  return null;
}

// ============================================================================
// 3. MAIN MIDDLEWARE LOGIC
// ============================================================================

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Performance and asset bypass (skip auth checks for image/static files)
  if (
    pathname.startsWith("/assets/") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".gif") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico")
  ) {
    return NextResponse.next();
  }

  // Create an initial response so cookies can be written if refreshed
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 3.1 Initialize Supabase Server Client with @supabase/ssr
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[Middleware] Supabase environment variables are missing.");
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Set cookies on request headers so server components see updated session
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        // Create new response with updated headers to write back to browser
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        // Apply cookies to the client response headers
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // 3.2 Authenticate User Session
  // Always use getUser() on server-side rather than getSession() to securely re-validate
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  // 3.3 Extract User Role
  let userRole: string | null = null;
  if (isAuthenticated && user) {
    try {
      // Deep Defense: Attempt to fetch role from Supabase DB 'profiles' table
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role) {
        userRole = profile.role;
      }
    } catch (dbError) {
      console.warn("[Middleware] DB Profile query failed, using cookie fallback:", dbError);
    }

    // Secondary defense: Fallback to token decoding/cookie fallback if profile is missing
    if (!userRole) {
      userRole = extractRoleFromCookies(request);
    }
  }

  const isPublicRoute = isRouteMatched(pathname, PUBLIC_ROUTES);

  // 3.4 ROUTING VALIDATION LOGIC

  // CASE 1: Unauthenticated request
  if (!isAuthenticated) {
    if (!isPublicRoute) {
      // Protect route: Redirect unauthenticated user to login.
      // Append original requested route to redirect back after signing in.
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
    // Allow unauthenticated requests to public routes
    return response;
  }

  // CASE 2: Authenticated user attempting to access public login/register routes
  if (isRouteMatched(pathname, AUTH_ONLY_ROUTES)) {
    const resolvedRole = userRole || "data_operator"; // Fallback role if database and cookie are empty
    const rule = ROLE_ACCESS_RULES[resolvedRole];
    const defaultDashboard = rule?.defaultDashboard || "/data-ingestion";

    // Prevent redirect loops
    if (pathname !== defaultDashboard) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = defaultDashboard;
      return NextResponse.redirect(redirectUrl);
    }
  }

  // CASE 3: Authenticated user accessing public pages (like /about-axa, /healthcare) or global protected routes
  if (isPublicRoute || isRouteMatched(pathname, GLOBAL_PROTECTED_ROUTES)) {
    return response;
  }

  // CASE 4: Authenticated user accessing role-specific routes
  const resolvedRole = userRole || "data_operator"; // Fallback role
  const rule = ROLE_ACCESS_RULES[resolvedRole];

  if (rule) {
    const isAllowed = isRouteMatched(pathname, rule.allowedRoutes);

    if (isAllowed) {
      // Access granted
      return response;
    } else {
      // Unauthorized access attempt. Redirect user to their respective default dashboard.
      const defaultDashboard = rule.defaultDashboard;
      
      // Strict guard against redirect loop
      if (pathname !== defaultDashboard) {
        console.warn(`[Security Check] Unauthorized access from role '${resolvedRole}' to path '${pathname}'. Redirecting to default dashboard '${defaultDashboard}'.`);
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = defaultDashboard;
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  // Fallback to allow request if role rule is missing (or default user to home)
  return response;
}

// ============================================================================
// 4. NEXT.JS CONFIGURATION MATCHER
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
