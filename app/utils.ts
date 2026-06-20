import { auth } from "@clerk/nextjs/server";
import { createClient as createLibsqlClient } from "@libsql/client";
import { createClient as createTursoClient } from "@tursodatabase/api";
import md5 from "md5";
import { redirect } from "next/navigation";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "@/db/schema";

const turso = createTursoClient({
  token: process.env.TURSO_API_TOKEN!,
  org: process.env.TURSO_ORG!,
});

export async function checkDatabaseExists(): Promise<boolean> {
  const dbName = getDatabaseName();

  if (!dbName) return false;

  try {
    await turso.databases.get(dbName);
    return true;
  } catch (error) {
    console.error("Error checking database existence:", error);
    return false;
  }
}

export async function getDatabaseClient() {
  const url = getLibsqlUrl();

  if (!url) {
    console.error("Failed to create database client: URL is null.");
    return redirect("/welcome");
  }

  try {
    const client = createLibsqlClient({
      url,
      authToken: process.env.TURSO_GROUP_AUTH_TOKEN,
    });

    return drizzle(client, { schema });
  } catch (error) {
    console.error("Failed to create database client:", error);
    return null;
  }
}

export function getDatabaseName(): string | null {
  const userId = auth().userId;
  return userId ? md5(userId) : null;
}

function getDatabaseUrl(dbName: string | null): string | null {
  return dbName ? `${dbName}-${process.env.TURSO_ORG}.turso.io` : null;
}

function getLibsqlUrl(): string | null {
  const dbName = getDatabaseName();
  const url = getDatabaseUrl(dbName);
  console.log({ url });
  return url ? `libsql://${url}` : null;
}

export function getDumpUrl(): string | null {
  const dbName = getDatabaseName();
  const url = getDatabaseUrl(dbName);
  return url ? `https://${url}/dump` : null;
}

export async function createUserDatabase(
  userId: string,
  region: "us" | "eu" = "us",
): Promise<boolean> {
  if (!userId) return false;

  const dbName = md5(userId);
  const group = region === "eu" ? "default" : "default";

  try {
    await turso.databases.create(dbName, {
      group,
      seed: {
        type: "database",
        name: process.env.TURSO_DATABASE_NAME!,
      },
    });

    return true;
  } catch (err) {
    console.error("Error creating user database:", err);
    return false;
  }
}

export async function checkTableExists(tableName: string): Promise<boolean> {
  const client = await getDatabaseClient();
  if (!client) return false;

  try {
    const result = await client.execute({
      sql: "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      args: [tableName],
    });
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking table existence:", error);
    return false;
  }
}

export async function runMigrations(): Promise<boolean> {
  const client = await getDatabaseClient();
  if (!client) return false;

  try {
    const migrations = [
      `CREATE TABLE IF NOT EXISTS "projects" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "emoji" text NOT NULL DEFAULT '📁',
        "created_at" integer NOT NULL DEFAULT (unixepoch())
      )`,
      `ALTER TABLE "todos" ADD "project_id" integer`,
      `ALTER TABLE "todos" ADD "priority" text NOT NULL DEFAULT 'medium'`,
      `ALTER TABLE "todos" ADD "due_date" text`,
      `ALTER TABLE "todos" ADD "created_at" integer NOT NULL DEFAULT (unixepoch())`,
    ];

    for (const migration of migrations) {
      try {
        await client.execute(migration);
      } catch (e) {
        if (
          !(e as Error).message.includes("duplicate column") &&
          !(e as Error).message.includes("already exists")
        ) {
          throw e;
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error running migrations:", error);
    return false;
  }
}

export type TemplateType = "blank" | "work" | "study";

export async function seedTemplateData(
  template: TemplateType,
): Promise<boolean> {
  const client = await getDatabaseClient();
  if (!client) return false;

  try {
    if (template === "blank") {
      return true;
    }

    const data: {
      projects: { name: string; description: string; emoji: string }[];
      todos: { description: string; priority?: string; dueDate?: string }[];
    } = { projects: [], todos: [] };

    if (template === "work") {
      data.projects = [
        { name: "产品开发", description: "产品功能开发任务", emoji: "🚀" },
        { name: "团队协作", description: "团队沟通与协作", emoji: "👥" },
        { name: "文档撰写", description: "技术文档和报告", emoji: "📝" },
      ];
      data.todos = [
        { description: "完成需求分析文档", priority: "high" },
        { description: "参加每日站会", priority: "medium" },
        { description: "代码审查", priority: "medium" },
        { description: "更新技术文档", priority: "low" },
        { description: "准备周会演示", priority: "high" },
      ];
    }

    if (template === "study") {
      data.projects = [
        { name: "课程学习", description: "在线课程和学习", emoji: "📚" },
        { name: "项目实践", description: "实践项目和作业", emoji: "💻" },
        { name: "阅读计划", description: "技术书籍阅读", emoji: "📖" },
      ];
      data.todos = [
        { description: "完成第三章练习", priority: "high" },
        { description: "复习上周知识点", priority: "medium" },
        { description: "做一个小项目实践", priority: "high" },
        { description: "阅读《深入理解计算机系统》第5章", priority: "low" },
        { description: "整理学习笔记", priority: "medium" },
      ];
    }

    let projectId: number | null = null;
    for (const project of data.projects) {
      const result = await client.execute({
        sql: "INSERT INTO projects (name, description, emoji) VALUES (?, ?, ?) RETURNING id",
        args: [project.name, project.description, project.emoji],
      });
      if (result.rows.length > 0 && !projectId) {
        projectId = result.rows[0].id as number;
      }
    }

    for (const todo of data.todos) {
      await client.execute({
        sql: "INSERT INTO todos (description, priority, project_id, due_date) VALUES (?, ?, ?, ?)",
        args: [
          todo.description,
          todo.priority || "medium",
          projectId,
          todo.dueDate || null,
        ],
      });
    }

    return true;
  } catch (error) {
    console.error("Error seeding template data:", error);
    return false;
  }
}
