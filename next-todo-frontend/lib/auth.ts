// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("No credentials provided");
          return null;
        }

        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            console.error(
              "Backend login failed",
              res.status,
              await res.text().catch(() => "")
            );
            return null;
          }

          // Go側のレスポンス: { "token": "..." } を想定
          const data = (await res.json()) as { token?: string };

          if (!data.token) {
            console.error("No token in backend response", data);
            return null;
          }

          // NextAuth に返すユーザー情報
          return {
            id: credentials.email,
            email: credentials.email,
            accessToken: data.token,
          } as any;
        } catch (e) {
          console.error("Authorize error", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // ログイン直後だけ user に accessToken が乗ってくる
      if (user && (user as any).accessToken) {
        (token as any).accessToken = (user as any).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      // クライアントから JWT を使えるように session にも積む
      (session as any).accessToken = (token as any).accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
