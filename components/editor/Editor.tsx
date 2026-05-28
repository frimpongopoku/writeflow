"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { useDocument } from "@/lib/hooks/useDocument";
import { useFocusMode } from "@/lib/hooks/useFocusMode";
import { FloatingToolbar } from "./FloatingToolbar";
import { StatsBar } from "./StatsBar";
import { ExportMenu } from "./ExportMenu";
import { Loader2, Maximize2, Minimize2 } from "lucide-react";

type SaveStatus = "saved" | "saving" | "unsaved";

interface EditorProps {
  docId: string;
  folderId: string;
}

const AUTOSAVE_DELAY = 2000;

export function Editor({ docId, folderId }: EditorProps) {
  const { document: wfDoc, loading, updateDocument } = useDocument(docId);
  const { focusMode, toggleFocusMode } = useFocusMode();
  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);
  const titleRef = useRef(title);
  titleRef.current = title;

  // Cmd/Ctrl+Shift+F toggles focus mode
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "F") {
        e.preventDefault();
        toggleFocusMode();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleFocusMode]);

  const scheduleAutoSave = useCallback(
    (content: string, wc: number) => {
      setSaveStatus("unsaved");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSaveStatus("saving");
        await updateDocument({ title: titleRef.current, content, wordCount: wc });
        setSaveStatus("saved");
      }, AUTOSAVE_DELAY);
    },
    [updateDocument]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Markdown,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    editorProps: {
      attributes: { class: "tiptap-editor outline-none" },
    },
    onUpdate({ editor: e }) {
      const text = e.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(text.length);
      const storage = e.storage as { markdown?: { getMarkdown: () => string } };
      const md = storage.markdown?.getMarkdown() ?? "";
      scheduleAutoSave(md, words);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!wfDoc || initialized.current || !editor) return;
    initialized.current = true;
    setTitle(wfDoc.title);
    if (wfDoc.content) editor.commands.setContent(wfDoc.content);
    const text = editor.getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.length);
    setSaveStatus("saved");
  }, [wfDoc, editor]);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
    const storage = editor?.storage as { markdown?: { getMarkdown: () => string } } | undefined;
    const md = storage?.markdown?.getMarkdown() ?? "";
    scheduleAutoSave(md, wordCount);
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      editor?.commands.focus("start");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-text-secondary" />
      </div>
    );
  }

  if (!wfDoc) {
    return (
      <div className="flex flex-1 items-center justify-center text-text-secondary text-sm">
        Document not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Top-right toolbar: export + focus toggle */}
      <div
        className="absolute top-4 right-5 z-10 flex items-center gap-1"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        {wfDoc && (
          <ExportMenu
            title={title}
            content={(() => {
              const s = editor?.storage as { markdown?: { getMarkdown: () => string } } | undefined;
              return s?.markdown?.getMarkdown() ?? wfDoc.content;
            })()}
          />
        )}
        <button
          onClick={toggleFocusMode}
          title={focusMode ? "Exit focus mode (⌘⇧F)" : "Focus mode (⌘⇧F)"}
          className="flex items-center justify-center size-7 rounded-md text-text-secondary hover:text-text-primary hover:bg-hover transition-colors"
        >
          {focusMode ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div
          className="mx-auto w-full px-10 pt-14 pb-24"
          style={{ maxWidth: "var(--wf-content-width)" }}
        >
          <input
            value={title}
            onChange={handleTitleChange}
            onKeyDown={handleTitleKeyDown}
            placeholder="Untitled"
            style={{
              fontFamily: "var(--wf-editor-font)",
              fontSize: "calc(var(--wf-editor-size) * 1.85)",
              lineHeight: 1.2,
            }}
            className="w-full font-bold text-text-primary bg-transparent border-none outline-none placeholder:text-text-secondary/25 mb-8 tracking-tight"
          />

          {editor && <FloatingToolbar editor={editor} />}
          <EditorContent editor={editor} />
        </div>
      </div>

      <StatsBar wordCount={wordCount} charCount={charCount} saveStatus={saveStatus} />
    </div>
  );
}
