"use server";

import { revalidatePath } from "next/cache";
import { eq, and, count, isNull } from "drizzle-orm";
import * as schema from "@/db/schema";
import { getDatabaseClient } from "@/app/utils";

export type ProjectItem = {
  id: number;
  name: string;
  description: string | null;
  emoji: string;
};

export const getProjects = async () => {
  const client = await getDatabaseClient();
  if (!client) return [];
  return client.query.projects.findMany({
    orderBy: (projects, { desc }) => [desc(projects.createdAt)],
  });
};

export const addProject = async (formData: FormData) => {
  const client = await getDatabaseClient();
  if (!client) return null;

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const emoji = (formData.get("emoji") as string) || "📁";

  const result = await client
    .insert(schema.projects)
    .values({ name, description, emoji })
    .returning();

  revalidatePath("/dashboard");
  return result[0];
};

export const updateProject = async (
  id: number,
  data: { name?: string; description?: string | null; emoji?: string },
) => {
  const client = await getDatabaseClient();
  if (!client) return null;

  await client
    .update(schema.projects)
    .set(data)
    .where(eq(schema.projects.id, id));

  revalidatePath("/dashboard");
};

export const deleteProject = async (id: number) => {
  const client = await getDatabaseClient();
  if (!client) return null;

  await client.transaction(async (tx) => {
    await tx
      .update(schema.todos)
      .set({ projectId: null })
      .where(eq(schema.todos.projectId, id));

    await tx.delete(schema.projects).where(eq(schema.projects.id, id));
  });

  revalidatePath("/dashboard");
};

export const getUncompletedTodosCount = async (projectId: number) => {
  const client = await getDatabaseClient();
  if (!client) return 0;

  const result = await client
    .select({ count: count() })
    .from(schema.todos)
    .where(
      and(
        eq(schema.todos.projectId, projectId),
        eq(schema.todos.completed, false),
      ),
    );

  return result[0]?.count || 0;
};

export const getProjectStats = async () => {
  const client = await getDatabaseClient();
  if (!client) return [];

  const result = await client
    .select({
      projectId: schema.todos.projectId,
      uncompletedCount: count(),
    })
    .from(schema.todos)
    .where(eq(schema.todos.completed, false))
    .groupBy(schema.todos.projectId);

  return result;
};
