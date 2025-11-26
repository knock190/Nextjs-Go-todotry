// src/app/todos/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TodoPage } from "@/features/todos/components/TodoPage";

export default async function TodosRoutePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <TodoPage />;
}
