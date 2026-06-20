"use server";

import { auth } from "@clerk/nextjs/server";
import {
  createUserDatabase,
  runMigrations,
  seedTemplateData,
  checkTableExists,
  type TemplateType,
} from "../utils";

export type Region = "us" | "eu";

export async function setupDatabase(
  region: Region,
  template: TemplateType,
): Promise<{ success: boolean; error?: string }> {
  const { userId } = auth().protect();

  if (!userId) {
    return { success: false, error: "未登录" };
  }

  try {
    const dbCreated = await createUserDatabase(userId, region);
    if (!dbCreated) {
      return { success: false, error: "创建数据库失败" };
    }

    const migrationsRun = await runMigrations();
    if (!migrationsRun) {
      return { success: false, error: "执行迁移失败" };
    }

    const seeded = await seedTemplateData(template);
    if (!seeded) {
      return { success: false, error: "初始化数据失败" };
    }

    return { success: true };
  } catch (error) {
    console.error("Setup database error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}

export async function checkTodosTableExists(): Promise<boolean> {
  return checkTableExists("todos");
}
