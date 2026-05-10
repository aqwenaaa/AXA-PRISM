/**
 * AXA-PRISM API Client — Flask Proxy Abstraction
 *
 * Architecture note (Next.js migration path):
 * ─────────────────────────────────────────────
 * In Next.js App Router, these calls would live in:
 *   /app/api/flask-proxy/route.ts  ← Server-side proxy (hides Flask URL + API keys)
 *   /lib/actions/*.ts              ← Server Actions (called from Client Components)
 *
 * Current implementation: mock data with typed interfaces, ready for API swap.
 *
 * To connect to real Flask:
 *   1. Set VITE_FLASK_API_URL in .env.local
 *   2. Replace simulateMock() calls with actual fetch() in each service
 *   3. In Next.js: move fetch() to Server Actions to avoid CORS
 */

const FLASK_BASE_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_FLASK_API_URL) ||
  "http://localhost:5000";

/** Simulate network latency for development realism */
export function simulateLatency(ms = 600): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Base headers for all Flask API requests */
export const FLASK_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "X-Platform": "AXA-PRISM",
  "X-Client-Version": "2.0.0",
  // "Authorization": `Bearer ${process.env.FLASK_API_KEY}` ← add in Next.js Server Action
};

/**
 * Generic POST to Flask API.
 * In Next.js: wrap this in a Server Action to keep API keys server-side.
 */
export async function flaskPost<TReq, TRes>(
  endpoint: string,
  body: TReq
): Promise<TRes> {
  const url = `${FLASK_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: "POST",
    headers: FLASK_HEADERS,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Flask API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<TRes>;
}

/**
 * Generic GET from Flask API.
 */
export async function flaskGet<TRes>(endpoint: string): Promise<TRes> {
  const url = `${FLASK_BASE_URL}${endpoint}`;
  const response = await fetch(url, { headers: FLASK_HEADERS });
  if (!response.ok) {
    throw new Error(`Flask API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<TRes>;
}
