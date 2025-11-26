// src/app/register/page.tsx
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    // すでにログイン済みなら /todos へ
    redirect("/todos");
  }

  return <RegisterForm />;
}
