"use client";

import { useOptimistic, useState, useMemo } from "react";
import { InferSelectModel } from "drizzle-orm";

import * as schema from "@/db/schema";
import { Todo } from "./todo";
import { Form } from "./form";
import { addTodo, removeTodo, toggleTodo } from "./actions";
import type { Priority } from "@/app/types";

type TodoType = InferSelectModel<typeof schema.todos>;
type Project = InferSelectModel<typeof schema.projects>;

type SortOption = "dueDate" | "priority" | "createdAt";
type FilterOption = "all" | "today" | "incomplete" | "completed";

function sortTodos(
  todos: TodoType[],
  sortBy: SortOption,
): TodoType[] {
  const sorted = [...todos];

  if (sortBy === "dueDate") {
    sorted.sort((a, b) => {
      const today = new Date().toISOString().split("T")[0];

      const aOverdue =
        !a.completed && a.dueDate && a.dueDate < today ? 0 : 1;
      const bOverdue =
        !b.completed && b.dueDate && b.dueDate < today ? 0 : 1;

      if (aOverdue !== bOverdue) return aOverdue - bOverdue;

      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  } else if (sortBy === "priority") {
    const priorityWeight: Record<Priority, number> = {
      high: 0,
      medium: 1,
      low: 2,
    };
    sorted.sort((a, b) => {
      const aPriority = (a.priority as Priority) || "medium";
      const bPriority = (b.priority as Priority) || "medium";
      return priorityWeight[aPriority] - priorityWeight[bPriority];
    });
  } else if (sortBy === "createdAt") {
    sorted.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }

  return sorted;
}

function filterTodos(
  todos: TodoType[],
  filter: FilterOption,
  projectId: number | null,
): TodoType[] {
  let filtered = todos;

  if (projectId !== null) {
    filtered = filtered.filter((t) => t.projectId === projectId);
  }

  const today = new Date().toISOString().split("T")[0];

  if (filter === "today") {
    filtered = filtered.filter(
      (t) => !t.completed && t.dueDate === today,
    );
  } else if (filter === "incomplete") {
    filtered = filtered.filter((t) => !t.completed);
  } else if (filter === "completed") {
    filtered = filtered.filter((t) => t.completed);
  }

  return filtered;
}

export function TodoList({
  initialTodos,
  projects,
  initialSelectedProjectId = null,
  initialFilter = "all",
}: {
  initialTodos: TodoType[];
  projects: Project[];
  initialSelectedProjectId?: number | null;
  initialFilter?: FilterOption;
}) {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    initialSelectedProjectId,
  );
  const [sortBy, setSortBy] = useState<SortOption>("dueDate");
  const [filter, setFilter] = useState<FilterOption>(initialFilter);

  const [optimisticTodos, addOptimisticTodo] = useOptimistic<
    TodoType[],
    { action: "add" | "remove" | "toggle"; todo: TodoType }
  >(initialTodos, (state, { action, todo }) => {
    switch (action) {
      case "add":
        return [...state, todo];
      case "remove":
        return state.filter((t) => t.id !== todo.id);
      case "toggle":
        return state.map((t) =>
          t.id === todo.id ? { ...t, completed: !t.completed } : t,
        );
    }
  });

  const filteredAndSortedTodos = useMemo(() => {
    const filtered = filterTodos(optimisticTodos, filter, selectedProjectId);
    return sortTodos(filtered, sortBy);
  }, [optimisticTodos, filter, sortBy, selectedProjectId]);

  const handleAddTodo = async (formData: FormData) => {
    const description = formData.get("description") as string;
    const priority = (formData.get("priority") as Priority) || "medium";
    const dueDate = (formData.get("dueDate") as string) || null;
    const projectId = formData.get("projectId")
      ? parseInt(formData.get("projectId") as string)
      : null;

    const newTodo: TodoType = {
      id: Date.now(),
      description,
      completed: false,
      priority,
      dueDate,
      projectId: projectId ?? selectedProjectId,
      createdAt: new Date(),
    };

    addOptimisticTodo({ action: "add", todo: newTodo });
    await addTodo(formData);
  };

  const handleRemoveTodo = async (id: number) => {
    addOptimisticTodo({
      action: "remove",
      todo: { id } as TodoType,
    });
    await removeTodo(id);
  };

  const handleToggleTodo = async (id: number) => {
    addOptimisticTodo({
      action: "toggle",
      todo: optimisticTodos.find((t) => t.id === id) as TodoType,
    });
    await toggleTodo(id);
  };

  const getProjectById = (id: number | null) => {
    if (!id) return null;
    return projects.find((p) => p.id === id) || null;
  };

  const currentProject =
    selectedProjectId !== null
      ? getProjectById(selectedProjectId)
      : null;

  const overdueHighlight = sortBy === "dueDate";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          {currentProject ? (
            <>
              <span className="text-2xl">{currentProject.emoji}</span>
              <span>{currentProject.name}</span>
            </>
          ) : (
            <>
              <span className="text-2xl">📋</span>
              <span>全部任务</span>
            </>
          )}
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterOption)}
            className="bg-white/10 text-white rounded px-2 py-1 text-sm outline-none"
          >
            <option value="all">全部</option>
            <option value="today">今日到期</option>
            <option value="incomplete">未完成</option>
            <option value="completed">已完成</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-white/10 text-white rounded px-2 py-1 text-sm outline-none"
          >
            <option value="dueDate">按截止日期</option>
            <option value="priority">按优先级</option>
            <option value="createdAt">按创建时间</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {filteredAndSortedTodos.map((todo) => (
          <Todo
            key={todo.id}
            item={todo}
            project={getProjectById(todo.projectId)}
            onRemove={handleRemoveTodo}
            onToggle={handleToggleTodo}
            isOverdueHighlight={overdueHighlight}
          />
        ))}
      </div>

      {filteredAndSortedTodos.length === 0 && (
        <div className="text-center py-8 text-white/40">
          <p>
            {filter === "today"
              ? "今天没有到期的任务"
              : filter === "incomplete"
                ? "没有未完成的任务"
                : filter === "completed"
                  ? "没有已完成的任务"
                  : "暂无任务，添加一个新任务吧"}
          </p>
        </div>
      )}

      <Form
        onSubmit={handleAddTodo}
        projects={projects}
        selectedProjectId={selectedProjectId}
      />
    </div>
  );
}
