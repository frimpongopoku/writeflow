"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { Bold, Italic, Strikethrough, Code, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIPopover } from "./AIPopover";

interface FloatingToolbarProps {
  editor: Editor;
}

interface ToolbarPos {
  top: number;
  left: number;
}

export function FloatingToolbar({ editor }: FloatingToolbarProps) {
  const [pos, setPos] = useState<ToolbarPos | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [savedSelection, setSavedSelection] = useState<{ from: number; to: number } | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const { hasSelection, isBold, isItalic, isStrike, isCode } = useEditorState({
    editor,
    selector: (ctx) => ({
      hasSelection: !ctx.editor.state.selection.empty,
      isBold: ctx.editor.isActive("bold"),
      isItalic: ctx.editor.isActive("italic"),
      isStrike: ctx.editor.isActive("strike"),
      isCode: ctx.editor.isActive("code"),
    }),
  });

  useEffect(() => {
    if (!hasSelection) {
      setPos(null);
      setAiOpen(false);
      setSavedSelection(null);
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setPos(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (!rect.width) {
      setPos(null);
      return;
    }

    const toolbarWidth = toolbarRef.current?.offsetWidth ?? 220;
    setPos({
      top: rect.top + window.scrollY - 48,
      left: rect.left + window.scrollX + rect.width / 2 - toolbarWidth / 2,
    });
  }, [hasSelection]);

  function openAI() {
    const { from, to } = editor.state.selection;
    setSavedSelection({ from, to });
    setAiOpen(true);
  }

  function closeAI() {
    setAiOpen(false);
    setSavedSelection(null);
  }

  if (!pos || !hasSelection) return null;

  const fmtButtons = [
    {
      label: "Bold",
      icon: <Bold className="size-3.5" />,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: isBold,
    },
    {
      label: "Italic",
      icon: <Italic className="size-3.5" />,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: isItalic,
    },
    {
      label: "Strikethrough",
      icon: <Strikethrough className="size-3.5" />,
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: isStrike,
    },
    {
      label: "Inline code",
      icon: <Code className="size-3.5" />,
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: isCode,
    },
  ];

  return createPortal(
    <div
      ref={toolbarRef}
      style={{ top: pos.top, left: pos.left, fontFamily: "var(--font-ui)" }}
      className="fixed z-50 rounded-lg border border-border bg-popup shadow-lg pointer-events-auto"
    >
      {aiOpen && savedSelection ? (
        <AIPopover
          editor={editor}
          selectionFrom={savedSelection.from}
          selectionTo={savedSelection.to}
          onClose={closeAI}
        />
      ) : (
        <div className="flex items-center gap-0.5 p-1">
          {fmtButtons.map((btn) => (
            <button
              key={btn.label}
              onMouseDown={(e) => {
                e.preventDefault();
                btn.action();
              }}
              aria-label={btn.label}
              className={cn(
                "flex items-center justify-center size-7 rounded-md transition-colors",
                btn.isActive
                  ? "bg-accent text-white font-semibold"
                  : "text-text-primary hover:bg-hover"
              )}
            >
              {btn.icon}
            </button>
          ))}

          <div className="w-px h-4 bg-border mx-0.5" />

          <button
            onMouseDown={(e) => { e.preventDefault(); openAI(); }}
            aria-label="AI actions"
            className="flex items-center justify-center size-7 rounded-md text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors"
          >
            <Sparkles className="size-3.5" />
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}
