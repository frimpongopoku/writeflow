"use client";

import { PenLine, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/auth-context";
import { FolderList } from "./FolderList";

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
    /*
     * Outer wrapper: controls width transition, NO overflow-hidden.
     * The toggle button lives here so it is never clipped.
     */
    <div
      className={cn(
        "relative h-full shrink-0 transition-[width] duration-200",
        collapsed ? "w-0" : "w-[220px]"
      )}
    >
      {/* Inner panel: clips content when collapsing */}
      <div className="absolute inset-0 overflow-hidden">
        <aside className="flex flex-col h-full w-[220px] bg-surface border-r border-border">

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
          <div className="flex items-center gap-2.5 px-3 py-2.5 border-t border-border shrink-0">
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

        </aside>
      </div>

      {/* Toggle — outside overflow-hidden, always visible */}
      <button
        onClick={onToggle}
        className="absolute top-1/2 -translate-y-1/2 -right-3 z-20 flex items-center justify-center size-6 rounded-full bg-popup border border-border text-text-secondary hover:text-text-primary shadow-sm transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
      </button>
    </div>
  );
}
