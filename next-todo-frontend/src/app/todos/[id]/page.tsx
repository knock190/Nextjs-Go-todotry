// src/app/api/todos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BACKEND_URL = process.env.BACKEND_URL!;

// セッションから JWT を取り出す共通関数
async function getAccessToken() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const token = (session as any).user?.accessToken as string | undefined;
  return token ?? null;
}

// // GET /api/todos/[id]  → 1件取得
// export async function GET(
//   req: NextRequest,
//   props: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await props.params;

//   const token = await getAccessToken();
//   if (!token) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const upstream = await fetch(`${BACKEND_URL}/api/todos/${id}`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   const text = await upstream.text();

//   return new NextResponse(text || null, {
//     status: upstream.status,
//     headers: {
//       "Content-Type":
//         upstream.headers.get("content-type") ?? "application/json",
//     },
//   });
// }

// PUT /api/todos/[id]  → 更新
export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  return new NextResponse(text || null, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

// DELETE /api/todos/[id]  → 削除
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const upstream = await fetch(`${BACKEND_URL}/api/todos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // 削除は body がなくてもOKなので text は読まずに status だけ返す
  return new NextResponse(null, {
    status: upstream.status,
  });
}
