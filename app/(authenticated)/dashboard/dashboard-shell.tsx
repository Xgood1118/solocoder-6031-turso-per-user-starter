"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InferSelectModel } from "drizzle-orm";
import * as schema from "@/db/schema";
import { TodoList } from "./todo-list";
import { ProjectList } from "./project-list";
import { TodayDueCard } from "./today-due-card";

type TodoType = InferSelectModel<typeof schema.todos>;
type Project = InferSelectModel<typeof schema.projects>;

type FilterOption = "all" | "today" | "incomplete" | "completed";

export function DashboardShell({
  initialTodos,
  initialProjects,
  todayDueCount,
}: {
  initialTodos: TodoType[];
  initialProjects: Project[];
  todayDueCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const filterParam = searchParams.get("filter") as FilterOption | null;
  const initialFilter: FilterOption =
    filterParam && ["all", "today", "incomplete", "completed"].includes(filterParam)
      ? filterParam
      : "all";

  const handleTodayDueClick = () => {
    router.push("/dashboard?filter=today");
  };

  const handleProjectSelect = (id: number | null) => {
    setSelectedProjectId(id);
  };

  return (
    <div className="space-y-6">
      <TodayDueCard count={todayDueCount} onClick={handleTodayDueClick} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ProjectList
            initialProjects={initialProjects}
            selectedProjectId={selectedProjectId}
            onProjectSelect={handleProjectSelect}
          />
        </div>
        <div className="lg:col-span-2">
          <TodoList
            initialTodos={initialTodos}
            projects={initialProjects}
            initialSelectedProjectId={selectedProjectId}
            initialFilter={initialFilter}
          />
        </div>
      </div>
    </div>
  );
}
