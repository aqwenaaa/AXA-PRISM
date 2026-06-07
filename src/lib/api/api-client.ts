import { supabase } from "./supabase-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * Dynamic fetch wrapper routing to port 8000 (FastAPI).
 * Automatically reads the client session to inject the active Supabase Auth JWT.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 15000, ...fetchOptions } = options;

  // 1. Retrieve the active access token directly from the Supabase client
  let token: string | undefined = undefined;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token;
    console.log(
      "[SESSION]",
      session
    );

    console.log(
      "[TOKEN]",
      session?.access_token
    );
  } catch (err) {
    console.warn("[API Client] Failed to retrieve Supabase session:", err);
  }

  // 2. Build request headers
  const headers = new Headers(fetchOptions.headers);
  if (!(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("X-Platform", "AXA-PRISM");
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // 3. Handle timeout controls
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    if (response.status === 401) {
      console.warn("[API Client] 401 Unauthorized returned from backend. JWT token is invalid or expired.");
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Standard GET helper.
 */
export async function apiGet<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return apiRequest<T>(path, { ...options, method: "GET" });
}

/**
 * Standard POST helper.
 */
export async function apiPost<TReq, TRes>(path: string, body: TReq, options: RequestOptions = {}): Promise<TRes> {
  return apiRequest<TRes>(path, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Standard PUT helper.
 */
export async function apiPut<TReq, TRes>(path: string, body: TReq, options: RequestOptions = {}): Promise<TRes> {
  return apiRequest<TRes>(path, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  });
}
