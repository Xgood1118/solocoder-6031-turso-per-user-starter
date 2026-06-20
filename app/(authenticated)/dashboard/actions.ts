"use server";

import { revalidatePath } from "next/cache";
import * as schema from "@/db/schema";
import { getDatabaseClient } from "@/app/utils";
import { eq, sql, and, count, gte, lte, isNull } from "drizzle-orm";

export type Priority = "low" | "medium" | "high";

export type TodoItem = {
  id: number;
  description: string;
  completed: boolean;
  projectId: number | null;
  priority: Priority;
  dueDate: string | null;
};

export const addTodo = async (formData: FormData) => {
  const client = await getDatabaseClient();

  const description = formData.get("description") as string;
  const priority = (formData.get("priority") as Priority) || "medium";
  const dueDate = (formData.get("dueDate") as string) || null;
  const projectId = formData.get("projectId")
    ? parseInt(formData.get("projectId") as string)
    : null;

  if (!client) return null;

  await client.insert(schema.todos).values({
    description,
    priority,
    dueDate,
    projectId,
  });

  revalidatePath("/dashboard");
};

export const removeTodo = async (id: number) => {
  const client = await getDatabaseClient();

  if (!client) return null;

  await client.delete(schema.todos).where(eq(schema.todos.id, id));

  revalidatePath("/dashboard");
};

export const toggleTodo = async (id: number) => {
  const client = await getDatabaseClient();

  if (!client) return null;

  await client
    .update(schema.todos)
    .set({ completed: sql`NOT completed` })
    .where(eq(schema.todos.id, id));

  revalidatePath("/dashboard");
};

export const updateTodoProject = async (id: number, projectId: number | null) => {
  const client = await getDatabaseClient();

  if (!client) return null;

  await client
    .update(schema.todos)
    .set({ projectId })
    .where(eq(schema.todos.id, id));

  revalidatePath("/dashboard");
};

export const updateTodoPriority = async (id: number, priority: Priority) => {
  const client = await getDatabaseClient();

  if (!client) return null;

  await client
    .update(schema.todos)
    .set({ priority })
    .where(eq(schema.todos.id, id));

  revalidatePath("/dashboard");
};

export const updateTodoDueDate = async (id: number, dueDate: string | null) => {
  const client = await getDatabaseClient();

  if (!client) return null;

  await client
    .update(schema.todos)
    .set({ dueDate })
    .where(eq(schema.todos.id, id));

  revalidatePath("/dashboard");
};

export const getTodayDueCount = async () => {
  const client = await getDatabaseClient();
  if (!client) return 0;

  const today = new Date().toISOString().split("T")[0];

  const result = await client
    .select({ count: count() })
    .from(schema.todos)
    .where(
      and(
        eq(schema.todos.completed, false),
        eq(schema.todos.dueDate, today),
      ),
    );

  return result[0]?.count || 0;
};

export const getTodayDueTodos = async () => {
  const client = await getDatabaseClient();
  if (!client) return [];

  const today = new Date().toISOString().split("T")[0];

  return client.query.todos.findMany({
    where: and(
      eq(schema.todos.completed, false),
      eq(schema.todos.dueDate, today),
    ),
  });
};

export const getOverdueTodos = async () => {
  const client = await getDatabaseClient();
  if (!client) return [];

  const today = new Date().toISOString().split("T")[0];

  return client.query.todos.findMany({
    where: and(
      eq(schema.todos.completed, false),
      lte(schema.todos.dueDate, today),
      sql`${schema.todos.dueDate} IS NOT NULL`,
    ),
    orderBy: (todos, { asc }) => [asc(todos.dueDate)],
  });
};

export const getTodosWithProjects = async () => {
  const client = await getDatabaseClient();
  if (!client) return { todos: [], projects: [] };

  const todos = await client.query.todos.findMany();
  const projects = await client.query.projects.findMany();

  return { todos, projects };
};
