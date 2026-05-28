"use client";

import { cn } from "@/lib/utils";

type SaveStatus = "saved" | "saving" | "unsaved";

interface StatsBarProps {
  wordCount: number;
  charCount: number;
  saveStatus: SaveStatus;
}

export function StatsBar({ wordCount, charCount, saveStatus }: StatsBarProps) {
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div
      className="flex items-center justify-between px-10 py-2.5 border-t border-border select-none shrink-0"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      {/* Stats — medium weight, fully legible secondary color */}
      <div className="flex items-center gap-5 text-[11.5px] font-medium text-text-secondary tabular-nums">
        <span>{wordCount.toLocaleString()} {wordCount === 1 ? "word" : "words"}</span>
        <span>{charCount.toLocaleString()} chars</span>
        <span>{readTime} min read</span>
      </div>

      {/* Save status — lighter weight to contrast with stats */}
      <span
        className={cn(
          "text-[11.5px] font-normal text-text-secondary transition-all duration-500",
          saveStatus === "saving" && "opacity-100",
          saveStatus === "saved" && "opacity-60",
          saveStatus === "unsaved" && "opacity-0 pointer-events-none"
        )}
      >
        {saveStatus === "saving" ? "Saving…" : "Saved"}
      </span>
    </div>
  );
}
