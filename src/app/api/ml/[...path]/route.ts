import { NextRequest, NextResponse } from "next/server";

const FLASK_API_BASE_URL = process.env.FLASK_API_BASE_URL ?? "http://127.0.0.1:5000";

async function proxy(request: NextRequest, method: string, path: string[]) {
  const query = request.nextUrl.searchParams.toString();
  const targetPath = path.join("/");
  const targetUrl = `${FLASK_API_BASE_URL}/${targetPath}${query ? `?${query}` : ""}`;
  const body = method === "GET" || method === "DELETE" ? undefined : await request.text();

  const response = await fetch(targetUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });

  const responseBody = await response.text();
  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  });
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
