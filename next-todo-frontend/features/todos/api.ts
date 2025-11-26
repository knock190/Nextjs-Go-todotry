// features/todos/api.ts
import type { Todo } from "./types";

async function handleResponse<T = any>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  if (res.status === 204) {
    // No Content
    return undefined as T;
  }

  return (await res.json()) as T;
}

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch("/api/todos", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return handleResponse<Todo[]>(res);
}

export async function createTodo(title: string): Promise<Todo> {
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });
  return handleResponse<Todo>(res);
}

export async function updateTodo(
  id: number,
  data: Partial<Pick<Todo, "title" | "completed">>
): Promise<Todo> {
  const res = await fetch(`/api/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Todo>(res);
}

export async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(`/api/todos/${id}`, {
    method: "DELETE",
  });
  await handleResponse(res);
}
