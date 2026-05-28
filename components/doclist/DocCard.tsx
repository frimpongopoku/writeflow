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
      {/* Title row */}
      <div className="flex items-baseline justify-between gap-2 mb-1">
        {/* Bold title — always fully legible */}
        <p className={cn(
          "text-[13.5px] font-semibold leading-snug truncate",
          isActive ? "text-accent" : "text-text-primary"
        )}>
          {doc.title || "Untitled"}
        </p>
        {/* Date — lighter weight, secondary color, no opacity modifier */}
        <span className="text-[11px] font-normal text-text-secondary shrink-0 tabular-nums">
          {relativeDate(doc.updatedAt)}
        </span>
      </div>

      {/* Preview — regular weight, secondary color */}
      {preview && (
        <p className="text-[12px] font-normal text-text-secondary leading-[1.55] line-clamp-2">
          {preview}
        </p>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="absolute right-2.5 top-2.5 flex items-center justify-center size-5 rounded opacity-0 group-hover:opacity-100 text-text-secondary hover:text-text-primary transition-opacity"
            onClick={(e) => e.stopPropagation()}
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
  );
}
