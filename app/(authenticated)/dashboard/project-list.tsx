"use client";

import { useState, useOptimistic } from "react";
import { InferSelectModel } from "drizzle-orm";
import * as schema from "@/db/schema";
import { ProjectItem } from "./project-item";
import { ProjectForm } from "./project-form";

type Project = InferSelectModel<typeof schema.projects>;

export function ProjectList({
  initialProjects,
  selectedProjectId,
  onProjectSelect,
}: {
  initialProjects: Project[];
  selectedProjectId: number | null;
  onProjectSelect: (id: number | null) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [optimisticProjects, addOptimisticProject] = useOptimistic<
    Project[],
    { action: "add" | "remove"; project: Project }
  >(initialProjects, (state, { action, project }) => {
    switch (action) {
      case "add":
        return [project, ...state];
      case "remove":
        return state.filter((p) => p.id !== project.id);
    }
  });

  const handleProjectCreated = () => {
    setShowForm(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">项目分组</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 bg-aquamarine/20 text-aquamarine rounded text-sm hover:bg-aquamarine/30 transition"
        >
          {showForm ? "取消" : "+ 新建项目"}
        </button>
      </div>

      {showForm && <ProjectForm onSubmit={handleProjectCreated} />}

      <div
        className={`flex items-center gap-3 rounded p-4 cursor-pointer transition ${
          selectedProjectId === null
            ? "bg-brunswick-green"
            : "bg-white/5 hover:bg-white/10"
        }`}
        onClick={() => onProjectSelect(null)}
      >
        <span className="text-2xl">📋</span>
        <div>
          <div className="text-white font-medium">未分组</div>
          <div className="text-white/60 text-sm">所有未分配到项目的任务</div>
        </div>
      </div>

      <div className="space-y-2">
        {optimisticProjects.map((project) => (
          <ProjectItem
            key={project.id}
            project={project}
            isSelected={selectedProjectId === project.id}
            onSelect={onProjectSelect}
          />
        ))}
      </div>

      {optimisticProjects.length === 0 && !showForm && (
        <div className="text-center py-8 text-white/40">
          <p>还没有项目，点击上方按钮创建第一个项目</p>
        </div>
      )}
    </div>
  );
}
