"use client";

import { useState, useRef, useEffect } from "react";

const EMOJIS = [
  "📁",
  "📂",
  "🚀",
  "💻",
  "📚",
  "📝",
  "🎯",
  "⭐",
  "🔥",
  "💡",
  "🎨",
  "🎵",
  "🏃",
  "🧘",
  "✈️",
  "🏠",
  "💼",
  "👥",
  "📖",
  "🎓",
  "💪",
  "🌟",
  "⚡",
  "🎪",
  "🌈",
  "🍎",
  "☕",
  "🏆",
  "🎯",
  "📊",
  "🎭",
  "🌱",
];

export function EmojiPicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (emoji: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={pickerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-3xl p-2 rounded bg-white/5 hover:bg-white/10 transition"
      >
        {selected}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-rich-black border border-white/10 rounded-lg shadow-xl z-50 w-72">
          <div className="grid grid-cols-8 gap-1">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onSelect(emoji);
                  setIsOpen(false);
                }}
                className={`text-xl p-2 rounded hover:bg-white/10 transition ${
                  selected === emoji ? "bg-white/20" : ""
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
