"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { VIRTUAL_FOLDER_TRASH } from "@/lib/types";
import { DocCard } from "./DocCard";

interface DocListProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function DocList({ collapsed, onToggle }: DocListProps) {
  const router = useRouter();
  const params = useParams();
  const folderId = (params?.folderId as string) ?? null;
  const activeDocId = (params?.docId as string) ?? null;

  const [search, setSearch] = useState("");
  const { documents, loading, createDocument, softDeleteDocument, restoreDocument } =
    useDocuments(folderId);

  const isTrash = folderId === VIRTUAL_FOLDER_TRASH;

  const filtered = search.trim()
    ? documents.filter(
        (d) =>
          d.title.toLowerCase().includes(search.toLowerCase()) ||
          d.content.toLowerCase().includes(search.toLowerCase())
      )
    : documents;

  async function handleNewDoc() {
    if (!folderId || isTrash) return;
    const id = await createDocument(folderId);
    if (id) router.push(`/dashboard/${folderId}/${id}`);
  }

  return (
    /*
     * Outer wrapper: controls width, NO overflow-hidden.
     * Toggle button lives here so it stays visible when collapsed.
     */
    <div
      className={cn(
        "relative h-full shrink-0 transition-[width] duration-200",
        collapsed ? "w-0" : "w-[260px]"
      )}
    >
      {/* Inner panel: clips content when collapsing */}
      <div className="absolute inset-0 overflow-hidden">
        <section className="flex flex-col h-full w-[260px] bg-background border-r border-border">

          {/* Header */}
          <div className="flex items-center gap-1.5 px-3 h-[52px] border-b border-border shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-text-secondary pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full h-7 pl-6 pr-2 text-[13px] font-medium bg-transparent text-text-primary placeholder:text-text-secondary outline-none border border-transparent focus:border-border rounded-md transition-colors"
              />
            </div>
            {!isTrash && folderId && (
              <button
                onClick={handleNewDoc}
                className="flex items-center justify-center size-7 rounded-md text-text-secondary hover:text-text-primary hover:bg-hover transition-colors shrink-0"
                aria-label="New document"
              >
                <Plus className="size-3.5" />
              </button>
            )}
          </div>

          {/* Doc list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="size-4 animate-spin text-text-secondary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-1.5 px-6 py-16 text-center">
                {!folderId ? (
                  <p className="text-[13px] font-medium text-text-secondary">Select a folder.</p>
                ) : search ? (
                  <p className="text-[13px] font-medium text-text-secondary">
                    No results for &ldquo;{search}&rdquo;
                  </p>
                ) : isTrash ? (
                  <p className="text-[13px] font-medium text-text-secondary">Trash is empty.</p>
                ) : (
                  <>
                    <p className="text-[13px] font-semibold text-text-secondary">No documents yet.</p>
                    <p className="text-[12px] font-normal text-text-secondary">Press + to create one.</p>
                  </>
                )}
              </div>
            ) : (
              filtered.map((d) => (
                <DocCard
                  key={d.id}
                  doc={d}
                  isActive={d.id === activeDocId}
                  onClick={() => folderId && router.push(`/dashboard/${folderId}/${d.id}`)}
                  onDelete={() => softDeleteDocument(d.id)}
                  onRestore={isTrash ? () => restoreDocument(d.id) : undefined}
                />
              ))
            )}
          </div>

        </section>
      </div>

      {/* Toggle — outside overflow-hidden, always visible */}
      <button
        onClick={onToggle}
        className="absolute top-1/2 -translate-y-1/2 -right-3 z-20 flex items-center justify-center size-6 rounded-full bg-popup border border-border text-text-secondary hover:text-text-primary shadow-sm transition-colors"
        aria-label={collapsed ? "Expand document list" : "Collapse document list"}
      >
        {collapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
      </button>
    </div>
  );
}
