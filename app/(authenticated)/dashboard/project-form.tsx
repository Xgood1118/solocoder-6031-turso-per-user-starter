"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { EmojiPicker } from "./emoji-picker";
import { addProject } from "./projects-actions";

export function ProjectForm({
  onSubmit,
}: {
  onSubmit?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedEmoji, setSelectedEmoji] = useState("📁");

  const handleSubmit = async (formData: FormData) => {
    formData.set("emoji", selectedEmoji);
    await addProject(formData);
    formRef.current?.reset();
    setSelectedEmoji("📁");
    onSubmit?.();
  };

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-3 rounded bg-brunswick-green p-4 shadow-sm"
      ref={formRef}
    >
      <div className="flex items-center gap-3">
        <EmojiPicker selected={selectedEmoji} onSelect={setSelectedEmoji} />
        <input
          id="name"
          name="name"
          placeholder="项目名称"
          className="flex-1 text-white bg-transparent placeholder:text-white/30 outline-none text-lg font-semibold"
          required
          maxLength={50}
          type="text"
        />
      </div>
      <input
        id="description"
        name="description"
        placeholder="项目描述（可选）"
        className="w-full text-white/80 bg-transparent placeholder:text-white/30 outline-none text-sm"
        maxLength={200}
        type="text"
      />
      <div className="flex justify-end">
        <Submit />
      </div>
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-aquamarine text-rich-black font-medium rounded hover:bg-aquamarine/90 transition disabled:opacity-50"
    >
      {pending ? "创建中..." : "创建项目"}
    </button>
  );
}
