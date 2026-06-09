import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

async function proxy(request: NextRequest, method: string, path: string[]) {
  const query = request.nextUrl.searchParams.toString();
  const targetPath = path.join("/");
  const targetUrl = `${API_BASE_URL}/${targetPath}${query ? `?${query}` : ""}`;

  // Forward request headers, excluding hop-by-hop and problematic encoding headers
  const headers = new Headers();
  const skipHeaders = new Set([
    "host", "origin", "referer", "connection", "content-length",
    "accept-encoding", "transfer-encoding",
  ]);
  request.headers.forEach((value, key) => {
    if (!skipHeaders.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  // Pass body stream directly for POST/PUT to support file uploads and JSON
  const body = method === "GET" || method === "HEAD" || method === "DELETE" ? undefined : request.body;

  try {
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      duplex: "half",
      cache: "no-store",
    } as any);

    const responseBody = await response.arrayBuffer();
    
    // Copy response headers, excluding hop-by-hop headers that cause issues
    const responseHeaders = new Headers();
    const skipResponseHeaders = new Set([
      "transfer-encoding", "connection", "content-encoding",
    ]);
    response.headers.forEach((value, key) => {
      if (!skipResponseHeaders.has(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error(`[API Proxy] ${method} ${targetUrl} failed:`, err?.cause?.code || err.message);
    return new NextResponse(
      JSON.stringify({ error: "Bad Gateway", detail: err.message }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxy(request, "GET", path);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxy(request, "POST", path);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxy(request, "PUT", path);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxy(request, "DELETE", path);
}
