"use client";

import { cn } from "@/lib/utils";
import type { EditorMode } from "@/lib/hooks/usePreferences";

type SaveStatus = "saved" | "saving" | "unsaved";

interface StatsBarProps {
  wordCount: number;
  charCount: number;
  saveStatus: SaveStatus;
  editorMode: EditorMode;
  onToggleMode: () => void;
}

export function StatsBar({
  wordCount,
  charCount,
  saveStatus,
  editorMode,
  onToggleMode,
}: StatsBarProps) {
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div
      className="flex items-center justify-between px-10 py-2 border-t border-border select-none shrink-0"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      {/* Left — document stats */}
      <div className="flex items-center gap-4 text-[11.5px] font-medium text-text-secondary tabular-nums">
        <span>{wordCount.toLocaleString()} {wordCount === 1 ? "word" : "words"}</span>
        <span>{charCount.toLocaleString()} chars</span>
        <span>{readTime} min read</span>
      </div>

      {/* Right — mode toggle + save status */}
      <div className="flex items-center gap-3">
        {/* Mode toggle pill */}
        <div className="flex items-center rounded-md border border-border overflow-hidden">
          {(["journaling", "markdown"] as EditorMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => editorMode !== mode && onToggleMode()}
              className={cn(
                "px-2.5 py-[3px] text-[11px] font-semibold transition-colors capitalize",
                editorMode === mode
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:text-text-primary hover:bg-hover"
              )}
            >
              {mode === "journaling" ? "Live" : "Markdown"}
            </button>
          ))}
        </div>

        {/* Save status */}
        <span
          className={cn(
            "text-[11.5px] font-normal text-text-secondary transition-all duration-500 min-w-[38px] text-right",
            saveStatus === "saving" && "opacity-100",
            saveStatus === "saved" && "opacity-50",
            saveStatus === "unsaved" && "opacity-0 pointer-events-none"
          )}
        >
          {saveStatus === "saving" ? "Saving…" : "Saved"}
        </span>
      </div>
    </div>
  );
}
