// src/app/api/todos/route.ts
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

export async function GET(_req: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const upstream = await fetch(`${BACKEND_URL}/api/todos`, {
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

export async function POST(req: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();

  const upstream = await fetch(`${BACKEND_URL}/api/todos`, {
    method: "POST",
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
