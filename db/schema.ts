import { text, integer, sqliteTable, foreignKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const projects = sqliteTable("projects", {
  id: integer("id", {
    mode: "number",
  }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  emoji: text("emoji").notNull().default("📁"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const todos = sqliteTable(
  "todos",
  {
    id: integer("id", {
      mode: "number",
    }).primaryKey({ autoIncrement: true }),
    description: text("description").notNull(),
    completed: integer("completed", { mode: "boolean" })
      .notNull()
      .default(false),
    projectId: integer("project_id", { mode: "number" }),
    priority: text("priority", { enum: ["low", "medium", "high"] })
      .notNull()
      .default("medium"),
    dueDate: text("due_date"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => {
    return {
      projectFk: foreignKey({
        columns: [table.projectId],
        foreignColumns: [projects.id],
      }),
    };
  },
);
