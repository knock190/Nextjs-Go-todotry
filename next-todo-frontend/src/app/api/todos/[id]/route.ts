// src/app/api/todos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BACKEND_URL = process.env.BACKEND_URL!;

async function getAccessToken() {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken as string | undefined;
  if (!session || !token) return null;
  return token;
}

// Next.js 16 では params が Promise になるので、型をこうしておく
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params; // ★ ここで await

  const token = await getAccessToken();
  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const upstream = await fetch(`${BACKEND_URL}/api/todos/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await upstream.text();

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function PUT(
  req: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params; // ★ ここで await

  const token = await getAccessToken();
  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();

  const upstream = await fetch(`${BACKEND_URL}/api/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const text = await upstream.text();

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params; // ★ ここで await

  const token = await getAccessToken();
  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const upstream = await fetch(`${BACKEND_URL}/api/todos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Go 側は 204 No Content を返す想定
  return new NextResponse(null, {
    status: upstream.status,
  });
}
