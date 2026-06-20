"use client";

import { useState, useTransition } from "react";
import { InferSelectModel } from "drizzle-orm";
import * as schema from "@/db/schema";
import { deleteProject, getUncompletedTodosCount } from "./projects-actions";

type Project = InferSelectModel<typeof schema.projects>;

export function ProjectItem({
  project,
  isSelected,
  onSelect,
}: {
  project: Project;
  isSelected: boolean;
  onSelect: (id: number | null) => void;
}) {
  const [_, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [uncompletedCount, setUncompletedCount] = useState<number | null>(null);

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const count = await getUncompletedTodosCount(project.id);
    setUncompletedCount(count);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    startTransition(() => {
      deleteProject(project.id);
      if (isSelected) {
        onSelect(null);
      }
    });
    setShowConfirm(false);
  };

  return (
    <>
      <div
        className={`flex items-center justify-between rounded p-4 cursor-pointer transition ${
          isSelected
            ? "bg-brunswick-green"
            : "bg-white/5 hover:bg-white/10"
        }`}
        onClick={() => onSelect(isSelected ? null : project.id)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{project.emoji}</span>
          <div>
            <div className="text-white font-medium">{project.name}</div>
            {project.description && (
              <div className="text-white/60 text-sm">{project.description}</div>
            )}
          </div>
        </div>
        <button
          onClick={handleDeleteClick}
          className="p-2 text-white/40 hover:text-red-400 hover:bg-white/10 rounded transition"
          aria-label="删除项目"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-rich-black border border-white/10 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-3">确认删除</h3>
            <p className="text-white/70 mb-6">
              {uncompletedCount && uncompletedCount > 0
                ? `该项目下还有 ${uncompletedCount} 个未完成任务，是否继续？`
                : "确定要删除这个项目吗？"}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-white/70 hover:text-white transition"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
