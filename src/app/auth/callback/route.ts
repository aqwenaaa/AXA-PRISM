import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const DEFAULT_AUTH_REDIRECT = "/dashboard";
const LOGIN_PATH = "/login";

function buildRedirectUrl(requestUrl: string, pathname: string, error?: string) {
  const url = new URL(requestUrl);
  url.pathname = pathname;
  url.search = "";

  if (error) {
    url.searchParams.set("error", error);
  }

  return url;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const oauthError =
    requestUrl.searchParams.get("error_description") ||
    requestUrl.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      buildRedirectUrl(request.url, LOGIN_PATH, "oauth_provider_error")
    );
  }

  if (!code) {
    return NextResponse.redirect(
      buildRedirectUrl(request.url, LOGIN_PATH, "missing_oauth_code")
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      buildRedirectUrl(request.url, LOGIN_PATH, "oauth_exchange_failed")
    );
  }

  return NextResponse.redirect(buildRedirectUrl(request.url, DEFAULT_AUTH_REDIRECT));
}
