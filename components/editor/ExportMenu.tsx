"use client";

import { useState } from "react";
import { Download, Copy, Check, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ExportMenuProps {
  title: string;
  content: string;
}

export function ExportMenu({ title, content }: ExportMenuProps) {
  const [copied, setCopied] = useState(false);

  function downloadMarkdown() {
    const filename = (title.trim() || "untitled").replace(/[^a-z0-9\-_. ]/gi, "").trim().replace(/\s+/g, "-") + ".md";
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center size-7 rounded-md text-text-secondary hover:text-text-primary hover:bg-hover transition-colors"
          aria-label="Export options"
        >
          <MoreHorizontal className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" style={{ fontFamily: "var(--font-ui)" }}>
        <DropdownMenuItem onClick={downloadMarkdown} className="gap-2.5">
          <Download className="size-3.5" />
          <span className="text-[13px]">Download as .md</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyToClipboard} className="gap-2.5">
          {copied ? <Check className="size-3.5 text-accent" /> : <Copy className="size-3.5" />}
          <span className="text-[13px]">{copied ? "Copied!" : "Copy to clipboard"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
