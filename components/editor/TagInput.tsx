"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, "-");
    if (!tag || tags.includes(tag) || tags.length >= 10) return;
    onChange([...tags, tag]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-accent/10 text-accent"
        >
          {tag}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
            className="flex items-center justify-center size-3 rounded-full hover:bg-accent/20 transition-colors"
          >
            <X className="size-2.5" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) addTag(input); }}
        placeholder={tags.length === 0 ? "Add tags…" : ""}
        className="text-[11.5px] text-text-secondary placeholder:text-text-secondary/40 bg-transparent outline-none border-none"
        style={{ width: tags.length === 0 ? "7ch" : `${Math.max(input.length + 1, 3)}ch` }}
      />
    </div>
  );
}
