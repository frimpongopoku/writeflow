"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { Loader2, Check, X, ChevronLeft } from "lucide-react";

type AIAction =
  | "rephrase"
  | "summarise"
  | "fix_grammar"
  | "make_shorter"
  | "make_longer"
  | "continue"
  | "tone_formal"
  | "tone_casual";

const ACTIONS: { action: AIAction; label: string }[] = [
  { action: "fix_grammar", label: "Fix grammar" },
  { action: "rephrase", label: "Rephrase" },
  { action: "make_shorter", label: "Make shorter" },
  { action: "make_longer", label: "Make longer" },
  { action: "summarise", label: "Summarise" },
  { action: "continue", label: "Continue writing" },
  { action: "tone_formal", label: "Formal tone" },
  { action: "tone_casual", label: "Casual tone" },
];

type Phase =
  | { name: "actions" }
  | { name: "loading"; action: AIAction }
  | { name: "result"; result: string; from: number; to: number }
  | { name: "error" };

interface AIPopoverProps {
  editor: Editor;
  selectionFrom: number;
  selectionTo: number;
  onClose: () => void;
}

export function AIPopover({ editor, selectionFrom, selectionTo, onClose }: AIPopoverProps) {
  const [phase, setPhase] = useState<Phase>({ name: "actions" });

  async function runAction(action: AIAction) {
    const selectedText = editor.state.doc.textBetween(selectionFrom, selectionTo, " ");
    const contextStart = Math.max(0, selectionFrom - 300);
    const context = editor.state.doc.textBetween(contextStart, selectionFrom, " ");

    setPhase({ name: "loading", action });

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, selectedText, context }),
      });
      const data = await res.json() as { result?: string };
      if (data.result) {
        setPhase({ name: "result", result: data.result, from: selectionFrom, to: selectionTo });
      } else {
        setPhase({ name: "error" });
      }
    } catch {
      setPhase({ name: "error" });
    }
  }

  function accept() {
    if (phase.name !== "result") return;
    editor
      .chain()
      .focus()
      .insertContentAt({ from: phase.from, to: phase.to }, phase.result)
      .run();
    onClose();
  }

  if (phase.name === "loading") {
    const label = ACTIONS.find((a) => a.action === phase.action)?.label ?? "Processing";
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 min-w-[160px]">
        <Loader2 className="size-3 shrink-0 animate-spin text-accent" />
        <span className="text-xs text-text-secondary">{label}…</span>
      </div>
    );
  }

  if (phase.name === "error") {
    return (
      <div className="flex flex-col gap-2 p-2 min-w-[160px]">
        <p className="text-xs text-text-secondary px-1">Something went wrong.</p>
        <div className="flex gap-1">
          <button
            onMouseDown={(e) => { e.preventDefault(); setPhase({ name: "actions" }); }}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-text-secondary hover:bg-hover transition-colors"
          >
            <ChevronLeft className="size-3" /> Back
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); onClose(); }}
            className="ml-auto flex items-center justify-center size-6 rounded text-text-secondary hover:bg-hover transition-colors"
          >
            <X className="size-3" />
          </button>
        </div>
      </div>
    );
  }

  if (phase.name === "result") {
    return (
      <div className="flex flex-col gap-2 p-2 w-64">
        <div className="max-h-28 overflow-y-auto rounded-md bg-surface border border-border px-2.5 py-2">
          <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap">
            {phase.result}
          </p>
        </div>
        <div className="flex items-center gap-1 pt-0.5">
          <button
            onMouseDown={(e) => { e.preventDefault(); accept(); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-accent text-white hover:bg-accent/90 transition-colors"
          >
            <Check className="size-3" /> Accept
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); setPhase({ name: "actions" }); }}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-text-secondary hover:bg-hover transition-colors"
          >
            <ChevronLeft className="size-3" /> Back
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); onClose(); }}
            className="ml-auto flex items-center justify-center size-6 rounded text-text-secondary hover:bg-hover transition-colors"
          >
            <X className="size-3" />
          </button>
        </div>
      </div>
    );
  }

  // actions phase
  return (
    <div className="flex flex-col py-1 min-w-[160px]">
      {ACTIONS.map(({ action, label }) => (
        <button
          key={action}
          onMouseDown={(e) => { e.preventDefault(); runAction(action); }}
          className="flex items-center px-3 py-1.5 text-xs text-text-primary hover:bg-hover transition-colors text-left"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
