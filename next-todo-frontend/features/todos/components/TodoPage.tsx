// features/todos/components/TodoPage.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import type { Todo } from "../types";
import { fetchTodos, createTodo, updateTodo, deleteTodo } from "../api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";


export function TodoPage() {
  const { data: session, status } = useSession();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTodos();
        setTodos(data);
      } catch (err: any) {
        console.error(err);
        setError("Todo の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      load();
    }
  }, [status]);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    try {
      const created = await createTodo(newTitle.trim());
      setTodos((prev) => [...prev, created]);
      setNewTitle("");
    } catch (err) {
      console.error(err);
      setError("Todo の追加に失敗しました");
    }
  };

  const handleToggle = async (todo: Todo) => {
    try {
      const newCompleted = !todo.completed;

      // API は「状態変更」を依頼するだけに使う
      await updateTodo(todo.id, { completed: newCompleted });

      // 表示に使うデータはフロント側で確実に更新
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id ? { ...t, completed: newCompleted } : t
        )
      );
    } catch (err) {
      console.error(err);
      setError("Todo の更新に失敗しました");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      setError("Todo の削除に失敗しました");
    }
  };

  if (status === "loading") {
    return <p className="p-4">認証状態を確認中...</p>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="w-full border-b bg-white">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold">Todo リスト</h1>
          <div className="flex items-center gap-3">
            {session?.user?.email && (
              <span className="text-sm text-slate-600">
                {session.user.email}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Card className="p-4 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Todo を入力..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <Button onClick={handleAdd}>追加</Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </Card>

        <Card className="p-4">
          {loading ? (
            <p>読み込み中...</p>
          ) : todos.length === 0 ? (
            <p className="text-slate-500 text-sm">Todo はまだありません。</p>
          ) : (
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center justify-between gap-3 border rounded-md px-3 py-2 bg-white"
                >
                  <label className="flex items-center gap-2 flex-1">
                    <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggle(todo)}
                    />
                    <span
                        className={`text-sm ${
                        todo.completed
                            ? "line-through text-slate-400"
                            : "text-slate-800"
                        }`}
                    >
                        {todo.title}
                    </span>
                    </label>

                    <div className="flex items-center gap-2">
                    
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(todo.id)}
                    >
                        削除
                    </Button>
                    </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>
    </div>
  );
}
