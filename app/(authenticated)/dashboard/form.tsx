"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { InferSelectModel } from "drizzle-orm";
import * as schema from "@/db/schema";

import { addTodo } from "./actions";
import type { Priority } from "@/app/types";

type Project = InferSelectModel<typeof schema.projects>;

export function Form({
  onSubmit,
  projects,
  selectedProjectId,
}: {
  onSubmit: (formData: FormData) => void;
  projects: Project[];
  selectedProjectId: number | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState<string>(
    selectedProjectId?.toString() || "",
  );

  const handleSubmit = async (formData: FormData) => {
    formData.set("priority", priority);
    if (dueDate) {
      formData.set("dueDate", dueDate);
    }
    if (projectId) {
      formData.set("projectId", projectId);
    }
    await onSubmit(formData);
    formRef.current?.reset();
    setPriority("medium");
    setDueDate("");
  };

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-3 rounded bg-brunswick-green p-4 shadow-sm"
      ref={formRef}
    >
      <div className="flex items-center space-x-3">
        <span className="p-1 text-2xl">☑️</span>
        <input
          id="description"
          name="description"
          placeholder="添加新任务..."
          className="w-full text-white bg-transparent placeholder:text-white/30 outline-none"
          required
          aria-label="任务描述"
          type="text"
          autoFocus
        />
      </div>

      {showAdvanced && (
        <div className="flex flex-wrap gap-4 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <label className="text-white/60 text-sm">优先级:</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="bg-white/10 text-white rounded px-2 py-1 text-sm outline-none"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-white/60 text-sm">截止日期:</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-white/10 text-white rounded px-2 py-1 text-sm outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-white/60 text-sm">项目:</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="bg-white/10 text-white rounded px-2 py-1 text-sm outline-none max-w-[150px]"
            >
              <option value="">未分组</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.emoji} {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-white/60 text-sm hover:text-white transition"
        >
          {showAdvanced ? "收起选项 ▲" : "更多选项 ▼"}
        </button>
        <Submit />
      </div>
    </form>
  );
}

export function Submit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      className="px-4 py-1.5 bg-aquamarine text-rich-black font-medium rounded hover:bg-aquamarine/90 transition text-sm disabled:opacity-50"
      disabled={pending}
    >
      {pending ? "添加中..." : "添加"}
    </button>
  );
}
