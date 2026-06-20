"use client";

import { useTransition } from "react";
import { InferSelectModel } from "drizzle-orm";

import * as schema from "@/db/schema";
import { removeTodo, toggleTodo } from "./actions";
import type { Priority } from "@/app/types";

type Todo = InferSelectModel<typeof schema.todos>;
type Project = InferSelectModel<typeof schema.projects>;

const priorityColors: Record<Priority, string> = {
  low: "bg-gray-400",
  medium: "bg-yellow-400",
  high: "bg-red-500",
};

const priorityLabels: Record<Priority, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const today = new Date().toISOString().split("T")[0];
  return dueDate < today;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  });
}

export function Todo({
  item,
  project,
  onRemove,
  onToggle,
  isOverdueHighlight = false,
}: {
  item: Todo;
  project?: Project | null;
  onRemove: (id: number) => void;
  onToggle: (id: number) => void;
  isOverdueHighlight?: boolean;
}) {
  const [_, startTransition] = useTransition();

  const priority = (item.priority as Priority) || "medium";
  const overdue = !item.completed && isOverdue(item.dueDate);
  const showOverdue = isOverdueHighlight && overdue;

  return (
    <li
      className={`flex items-center justify-between rounded p-4 transition ${
        showOverdue
          ? "bg-red-900/30 border border-red-500/50"
          : "bg-white/5"
      }`}
    >
      <div className="flex w-full items-center space-x-3">
        <div
          className={`w-2 h-8 rounded-full ${priorityColors[priority]}`}
          title={`优先级: ${priorityLabels[priority]}`}
        />
        <button
          className="p-1 text-2xl"
          onClick={() => {
            startTransition(() => {
              onToggle(item.id);
            });
          }}
        >
          {item.completed ? "✅" : "☑️"}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`${
                item.completed ? "line-through text-white/40" : "text-white"
              } ${overdue ? "text-red-400" : ""}`}
            >
              {item.description}
            </span>
            {project && (
              <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-white/60 flex items-center gap-1">
                <span>{project.emoji}</span>
                <span>{project.name}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-white/40">
              优先级: {priorityLabels[priority]}
            </span>
            {item.dueDate && (
              <span
                className={`text-xs ${
                  overdue ? "text-red-400" : "text-white/40"
                }`}
              >
                📅 {formatDate(item.dueDate)}
                {overdue && " (已过期)"}
              </span>
            )}
          </div>
        </div>
      </div>
      <button
        className="p-1 flex items-center justify-between transition hover:bg-white/10 rounded"
        onClick={() => {
          startTransition(() => {
            onRemove(item.id);
          });
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-5 text-white/60"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </button>
    </li>
  );
}
