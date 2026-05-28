"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { useDocument } from "@/lib/hooks/useDocument";
import { usePreferences } from "@/lib/hooks/usePreferences";
import { useFocusMode } from "@/lib/hooks/useFocusMode";
import { FloatingToolbar } from "./FloatingToolbar";
import { StatsBar } from "./StatsBar";
import { MarkdownEditor } from "./MarkdownEditor";
import { Loader2, Maximize2, Minimize2, Download, Copy, Check } from "lucide-react";

type SaveStatus = "saved" | "saving" | "unsaved";

interface EditorProps {
  docId: string;
  folderId: string;
}

const AUTOSAVE_DELAY = 2000;

function getMd(editor: ReturnType<typeof useEditor> | null): string {
  if (!editor) return "";
  const storage = editor.storage as { markdown?: { getMarkdown: () => string } };
  return storage.markdown?.getMarkdown() ?? "";
}

export function Editor({ docId, folderId }: EditorProps) {
  const { document: wfDoc, loading, updateDocument } = useDocument(docId);
  const { prefs, updatePrefs } = usePreferences();
  const { focusMode, toggleFocusMode } = useFocusMode();

  const [title, setTitle] = useState("");
  // Single source of truth for the raw markdown string — both modes read/write this.
  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);
  const titleRef = useRef(title);
  titleRef.current = title;
  const contentRef = useRef(content);
  contentRef.current = content;

  const isMarkdownMode = prefs.editorMode === "markdown";

  /* ── Keyboard shortcut ───────────────────────────────────────────── */
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

  /* ── Auto-save ───────────────────────────────────────────────────── */
  const scheduleAutoSave = useCallback(
    (md: string, wc: number) => {
      setSaveStatus("unsaved");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSaveStatus("saving");
        await updateDocument({ title: titleRef.current, content: md, wordCount: wc });
        setSaveStatus("saved");
      }, AUTOSAVE_DELAY);
    },
    [updateDocument]
  );

  /* ── Tiptap instance ─────────────────────────────────────────────── */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Markdown,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    editorProps: { attributes: { class: "tiptap-editor outline-none" } },
    onUpdate({ editor: e }) {
      const md = getMd(e);
      const text = e.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      // Keep shared content state in sync so switching to markdown mode shows latest
      setContent(md);
      setWordCount(words);
      setCharCount(text.length);
      scheduleAutoSave(md, words);
    },
    immediatelyRender: false,
  });

  /* ── Initial load from Firestore ─────────────────────────────────── */
  useEffect(() => {
    if (!wfDoc || initialized.current) return;
    initialized.current = true;
    setTitle(wfDoc.title);
    setContent(wfDoc.content);
    if (editor && wfDoc.content) {
      editor.commands.setContent(wfDoc.content);
    }
    const words = wfDoc.content.trim() ? wfDoc.content.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(wfDoc.content.length);
    setSaveStatus("saved");
  }, [wfDoc, editor]);

  /* ── Sync content INTO Tiptap when switching TO journaling mode ──── */
  useEffect(() => {
    if (!isMarkdownMode && editor && initialized.current) {
      // Push the latest markdown string into Tiptap so it renders correctly
      editor.commands.setContent(contentRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMarkdownMode]);

  /* ── Handlers ────────────────────────────────────────────────────── */
  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    scheduleAutoSave(contentRef.current, wordCount);
  }

  function handleMarkdownChange(md: string) {
    setContent(md);
    const words = md.trim() ? md.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(md.length);
    scheduleAutoSave(md, words);
  }

  function handleDownload() {
    const filename =
      (title.trim() || "untitled")
        .replace(/[^a-z0-9\-_. ]/gi, "")
        .trim()
        .replace(/\s+/g, "-") + ".md";
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleToggleMode() {
    if (!isMarkdownMode) {
      // Switching TO markdown: flush latest content from Tiptap first
      const md = getMd(editor);
      if (md) setContent(md);
    }
    updatePrefs({ editorMode: isMarkdownMode ? "journaling" : "markdown" });
  }

  /* ── Loading / not found ─────────────────────────────────────────── */
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

  /* ── Shared top-right toolbar ────────────────────────────────────── */
  const btnCls =
    "flex items-center justify-center size-7 rounded-md text-text-secondary hover:text-text-primary hover:bg-hover transition-colors";

  const toolbar = (
    <div
      className="absolute top-4 right-5 z-10 flex items-center gap-0.5"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      {/* Download .md */}
      <button onClick={handleDownload} title="Download as .md" className={btnCls}>
        <Download className="size-3.5" />
      </button>

      {/* Copy to clipboard */}
      <button onClick={handleCopy} title="Copy markdown to clipboard" className={btnCls}>
        {copied
          ? <Check className="size-3.5 text-accent" />
          : <Copy className="size-3.5" />}
      </button>

      {/* Divider */}
      <div className="w-px h-4 bg-border mx-1" />

      {/* Focus mode */}
      <button
        onClick={toggleFocusMode}
        title={focusMode ? "Exit focus mode (⌘⇧F)" : "Focus mode (⌘⇧F)"}
        className={btnCls}
      >
        {focusMode ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
      </button>
    </div>
  );

  const statsBar = (
    <StatsBar
      wordCount={wordCount}
      charCount={charCount}
      saveStatus={saveStatus}
      editorMode={prefs.editorMode}
      onToggleMode={handleToggleMode}
    />
  );

  /* ── Markdown split-pane mode ────────────────────────────────────── */
  if (isMarkdownMode) {
    return (
      <div className="flex flex-col h-full relative">
        {toolbar}
        <MarkdownEditor
          title={title}
          content={content}
          onTitleChange={handleTitleChange}
          onContentChange={handleMarkdownChange}
        />
        {statsBar}
      </div>
    );
  }

  /* ── Journaling (Tiptap WYSIWYG) mode ───────────────────────────── */
  return (
    <div className="flex flex-col h-full relative">
      {toolbar}
      <div className="flex-1 overflow-y-auto">
        <div
          className="mx-auto w-full px-10 pt-14 pb-24"
          style={{ maxWidth: "var(--wf-content-width)" }}
        >
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "ArrowDown") {
                e.preventDefault();
                editor?.commands.focus("start");
              }
            }}
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
      {statsBar}
    </div>
  );
}
