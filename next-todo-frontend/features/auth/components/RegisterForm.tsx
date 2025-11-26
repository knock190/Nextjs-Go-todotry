// features/auth/components/RegisterForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const registerSchema = z
  .object({
    name: z.string().min(1, "名前を入力してください"),
    email: z.string().email("正しいメールアドレスを入力してください"),
    password: z.string().min(6, "パスワードは6文字以上で入力してください"),
    confirmPassword: z.string().min(6, "パスワードは6文字以上で入力してください"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      if (res.status === 201) {
        // 登録成功 → ログインページへ
        router.push("/login");
        return;
      }

      const text = await res.text();
      setServerError(text || "登録に失敗しました");
    } catch (e) {
      console.error(e);
      setServerError("サーバーエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-xl font-semibold text-center mb-2">
          ユーザー新規登録
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">名前</Label>
            <Input id="name" type="text" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-red-500">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-red-500">
                {errors.email.message as string}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">パスワード</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-xs text-red-500">
                {errors.password.message as string}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirmPassword">パスワード（確認）</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">
                {errors.confirmPassword.message as string}
              </p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-center text-red-500">{serverError}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "登録中..." : "登録する"}
          </Button>
        </form>

        <p className="text-xs text-center text-slate-500 mt-2">
          すでにアカウントをお持ちの方は{" "}
          <a href="/login" className="text-blue-600 underline">
            ログインページへ
          </a>
        </p>
      </Card>
    </div>
  );
}
