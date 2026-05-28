"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FilesIcon, Trash2, MoreHorizontal, Plus, Pencil, Trash, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFolders } from "@/lib/hooks/useFolders";
import { VIRTUAL_FOLDER_ALL, VIRTUAL_FOLDER_TRASH } from "@/lib/types";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function FolderList() {
  const router = useRouter();
  const params = useParams();
  const activeFolderId = (params?.folderId as string) ?? null;
  const { folders, createFolder, renameFolder, deleteFolder } = useFolders();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId) renameRef.current?.focus();
  }, [renamingId]);

  function startRename(id: string, currentName: string) {
    setRenamingId(id);
    setRenameValue(currentName);
  }

  async function commitRename() {
    if (renamingId && renameValue.trim()) {
      await renameFolder(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  }

  async function handleNewFolder() {
    const id = await createFolder("Untitled Folder");
    if (id) startRename(id, "Untitled Folder");
  }

  const navItem = (folderId: string) => router.push(`/dashboard/${folderId}`);

  const virtualItems = [
    { id: VIRTUAL_FOLDER_ALL,   label: "All Documents", Icon: FilesIcon },
    { id: VIRTUAL_FOLDER_TRASH, label: "Trash",         Icon: Trash2 },
  ];

  function itemCls(id: string) {
    return cn(
      "flex items-center gap-2 w-full px-2 py-[5px] rounded-[6px] text-[13px] transition-colors text-left select-none cursor-pointer",
      activeFolderId === id
        ? "bg-accent/[0.12] text-accent font-semibold"
        : "font-medium text-text-secondary hover:bg-hover hover:text-text-primary"
    );
  }

  return (
    <div className="flex flex-col gap-px">

      {/* Virtual folders */}
      {virtualItems.map(({ id, label, Icon }) => (
        <button key={id} onClick={() => navItem(id)} className={itemCls(id)}>
          <Icon className="size-[14px] shrink-0" />
          <span className="truncate">{label}</span>
        </button>
      ))}

      {/* Section header — bold label, legible at all themes */}
      <div className="flex items-center justify-between px-2 pt-4 pb-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-secondary">
          Folders
        </span>
        <button
          onClick={handleNewFolder}
          className="flex items-center justify-center size-4 rounded text-text-secondary hover:text-text-primary transition-colors"
          aria-label="New folder"
        >
          <Plus className="size-3" />
        </button>
      </div>

      {/* User folders */}
      {folders.map((folder) => {
        const isActive = activeFolderId === folder.id;
        const isRenaming = renamingId === folder.id;
        return (
          <div key={folder.id} className="group relative flex items-center">
            <button
              onClick={() => !isRenaming && navItem(folder.id)}
              className={itemCls(folder.id)}
            >
              <Folder className="size-[14px] shrink-0" />
              {isRenaming ? (
                <input
                  ref={renameRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  className="flex-1 bg-transparent outline-none text-text-primary text-[13px] font-medium min-w-0"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="truncate flex-1">{folder.name}</span>
              )}
            </button>

            {!isRenaming && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "absolute right-1 flex items-center justify-center size-5 rounded text-text-secondary hover:text-text-primary transition-opacity",
                      isActive ? "opacity-70 hover:opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="size-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem onClick={() => startRename(folder.id, folder.name)}>
                    <Pencil className="size-3 mr-2" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => deleteFolder(folder.id)}
                  >
                    <Trash className="size-3 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      })}
    </div>
  );
}
