"use client";

import { MoreHorizontal, Trash2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WFDocument } from "@/lib/types";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DocCardProps {
  doc: WFDocument;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  onRestore?: () => void;
}

function relativeDate(ts: WFDocument["updatedAt"] | null): string {
  if (!ts) return "";
  const date = ts.toDate();
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  if (days < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function DocCard({ doc, isActive, onClick, onDelete, onRestore }: DocCardProps) {
  const preview = doc.content.replace(/[#*`~>\-_[\]]/g, "").trim().slice(0, 90);
  const tags = doc.tags ?? [];
  const visibleTags = tags.slice(0, 3);
  const overflow = tags.length - visibleTags.length;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative px-4 py-3.5 border-b border-border cursor-pointer transition-colors",
        isActive
          ? "bg-accent/[0.08] border-l-[3px] border-l-accent"
          : "hover:bg-hover border-l-[3px] border-l-transparent"
      )}
    >
      {/* Title row — date and ••• share the same slot, swap on hover */}
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <p className={cn(
          "text-[13.5px] font-semibold leading-snug truncate",
          isActive ? "text-accent" : "text-text-primary"
        )}>
          {doc.title || "Untitled"}
        </p>

        {/* Slot: date fades out on hover, ••• fades in */}
        <div className="relative shrink-0 flex items-center justify-end">
          <span className="text-[11px] font-normal text-text-secondary tabular-nums transition-opacity group-hover:opacity-0 pointer-events-none select-none">
            {relativeDate(doc.updatedAt)}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="absolute inset-0 flex items-center justify-end opacity-0 group-hover:opacity-100 text-text-secondary hover:text-text-primary transition-opacity"
                onClick={(e) => e.stopPropagation()}
                aria-label="Document options"
              >
                <MoreHorizontal className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
              {doc.isDeleted && onRestore ? (
                <DropdownMenuItem onClick={onRestore}>
                  <RotateCcw /> Restore
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  onClick={onDelete}
                >
                  <Trash2 className="text-destructive" /> Move to Trash
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <p className="text-[12px] font-normal text-text-secondary leading-[1.55] line-clamp-2 mb-2">
          {preview}
        </p>
      )}

      {/* Tags */}
      {visibleTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-accent/10 text-accent leading-none"
            >
              {tag}
            </span>
          ))}
          {overflow > 0 && (
            <span className="text-[10px] text-text-secondary font-medium">+{overflow}</span>
          )}
        </div>
      )}
    </div>
  );
}
