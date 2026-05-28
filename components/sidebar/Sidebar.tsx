"use client";

import { PenLine, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/auth-context";
import { FolderList } from "./FolderList";
import versionData from "@/version.json";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onOpenSettings: () => void;
}

export function Sidebar({ collapsed, onToggle, onOpenSettings }: SidebarProps) {
  const { user } = useAuth();
  const initials = user?.displayName
    ?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "?";

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-surface border-r border-border shrink-0 overflow-hidden transition-[width] duration-200",
        collapsed ? "w-10" : "w-[220px]"
      )}
    >
      {/* ── Collapsed strip ── clickable expand button */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-text-secondary hover:text-text-primary hover:bg-hover transition-colors group"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="size-4" />
        </button>
      )}

      {/* ── Expanded content ── (invisible while collapsed so no flash during transition) */}
      <div className={cn(
        "flex flex-col h-full min-w-[220px] transition-opacity duration-150",
        collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-[52px] border-b border-border shrink-0">
          <PenLine className="size-[17px] text-accent shrink-0" strokeWidth={2.25} />
          <span className="text-[14px] font-bold tracking-tight text-text-primary">WriteFlow</span>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <FolderList />
        </div>

        {/* Footer */}
        <div className="flex flex-col border-t border-border shrink-0">
          {/* Version */}
          <div className="px-4 pt-2 pb-1">
            <span className="text-[10px] font-medium text-text-secondary/40 select-none">
              v{versionData.version} {versionData.stage}
            </span>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2.5">
          {user?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoURL} alt="" className="size-6 rounded-full shrink-0 ring-1 ring-border" />
          ) : (
            <div className="size-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-accent">{initials}</span>
            </div>
          )}
          <span className="flex-1 text-[12.5px] font-medium text-text-secondary truncate min-w-0">
            {user?.displayName?.split(" ")[0] ?? "Account"}
          </span>
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center size-6 rounded-md text-text-secondary hover:text-text-primary hover:bg-hover transition-colors shrink-0"
            aria-label="Settings"
          >
            <Settings className="size-[13px]" />
          </button>
          </div>
        </div>

        {/* Collapse button — bottom of expanded sidebar */}
        <button
          onClick={onToggle}
          className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center justify-center w-5 h-10 rounded-l-md bg-hover text-text-secondary hover:text-text-primary hover:bg-border transition-colors"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className="size-3" />
        </button>
      </div>
    </aside>
  );
}
