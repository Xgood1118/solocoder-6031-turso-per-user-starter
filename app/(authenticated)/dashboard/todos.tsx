"use client";

import { useState, useEffect } from "react";
import { getDatabaseClient } from "@/app/utils";
import { TodoList } from "./todo-list";
import { ProjectList } from "./project-list";
import { TodayDueCard } from "./today-due-card";
import { getTodayDueCount } from "./actions";
import { useSearchParams, useRouter } from "next/navigation";

export function Todos() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<{
    todos: any[];
    projects: any[];
    todayDueCount: number;
  } | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const filter = searchParams.get("filter") as
    | "all"
    | "today"
    | "incomplete"
    | "completed"
    | null;

  useEffect(() => {
    const fetchData = async () => {
      const client = await getDatabaseClient();
      if (!client) {
        setData({ todos: [], projects: [], todayDueCount: 0 });
        return;
      }

      try {
        const [todos, projects, todayDueCount] = await Promise.all([
          client.query.todos.findMany(),
          client.query.projects.findMany(),
          getTodayDueCount(),
        ]);

        setData({
          todos: todos || [],
          projects: projects || [],
          todayDueCount,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setData({ todos: [], projects: [], todayDueCount: 0 });
      }
    };

    fetchData();
  }, []);

  if (!data) {
    return <p className="text-white/60 text-center">加载中...</p>;
  }

  const { todos, projects, todayDueCount } = data;

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
            initialProjects={projects}
            selectedProjectId={selectedProjectId}
            onProjectSelect={handleProjectSelect}
          />
        </div>
        <div className="lg:col-span-2">
          <TodoList
            initialTodos={todos}
            projects={projects}
            initialSelectedProjectId={selectedProjectId}
            initialFilter={filter || "all"}
          />
        </div>
      </div>
    </div>
  );
}
