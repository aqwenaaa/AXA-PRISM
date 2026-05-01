import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const roleRoutePrefixes: Record<string, string> = {
  operator: "/operator",
  analyst: "/analyst",
  auditor: "/auditor",
  manager: "/manager",
};

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const role = request.cookies.get("axa_role")?.value;
  if (!role) return NextResponse.next();

  const protectedPrefix = Object.values(roleRoutePrefixes).find((prefix) => pathname.startsWith(prefix));
  if (!protectedPrefix) return NextResponse.next();

  const expectedPrefix = roleRoutePrefixes[role];
  if (!expectedPrefix || pathname.startsWith(expectedPrefix)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(expectedPrefix, request.url));
}

export const config = {
  matcher: ["/operator/:path*", "/analyst/:path*", "/auditor/:path*", "/manager/:path*"],
};
