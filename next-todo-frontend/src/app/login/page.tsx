// app/login/page.tsx
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      {/* ここ追加 */}
      <p className="mt-4 text-center text-xs text-slate-500">
        アカウントをお持ちでない方は{" "}
        <a href="/register" className="text-blue-600 underline">
          新規登録はこちら
        </a>
      </p>
    </>
  );
}
