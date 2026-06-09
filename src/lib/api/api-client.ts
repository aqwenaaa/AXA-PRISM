import { supabase } from "./supabase-client";

const isBrowser = typeof window !== "undefined";
const API_BASE_URL = isBrowser ? "/api/ml" : (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000");

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  /** If true, skip the request entirely when no auth token is available */
  requiresAuth?: boolean;
}

/**
 * Dynamic fetch wrapper routing to port 8000 (FastAPI).
 * Automatically reads the client session to inject the active Supabase Auth JWT.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 30000, requiresAuth = true, ...fetchOptions } = options;
  const method = fetchOptions.method ?? "GET";
  const fullUrl = `${API_BASE_URL}${path}`;

  // 1. Retrieve the active access token directly from the Supabase client
  let token: string | undefined = undefined;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token;
  } catch {
    // Session retrieval failed — will proceed without token
  }

  // 2. If auth is required but no token exists, fail fast instead of sending a 401-destined request
  if (requiresAuth && !token) {
    throw new Error("No active authentication session. Please log in.");
  }

  // 3. Build request headers
  const headers = new Headers(fetchOptions.headers);
  if (!(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("X-Platform", "AXA-PRISM");
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // 4. Handle timeout controls
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });
    if (response.status === 401) {
      console.warn("[API Client] 401 Unauthorized — JWT token may be invalid or expired.");
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
