"use client";

import { useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownEditorProps {
  title: string;
  content: string;
  onTitleChange: (t: string) => void;
  onContentChange: (c: string) => void;
}

export function MarkdownEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;

    if (e.key === "Tab") {
      e.preventDefault();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = ta.value.slice(0, start) + "  " + ta.value.slice(end);
      onContentChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
      return;
    }

    if (e.key === "Enter") {
      const start = ta.selectionStart;
      const value = ta.value;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const currentLine = value.slice(lineStart, start);

      const unordered = currentLine.match(/^(\s*)([-*+]) /);
      const ordered = currentLine.match(/^(\s*)(\d+)\. /);
      const match = unordered ?? ordered;
      if (!match) return;

      e.preventDefault();
      const prefixLen = match[0].length;
      const lineContent = currentLine.slice(prefixLen);

      if (lineContent.trim() === "") {
        // Empty list item — exit the list by removing the bullet
        const newValue = value.slice(0, lineStart) + value.slice(start);
        onContentChange(newValue);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = lineStart;
        });
      } else {
        // Continue the list
        let bullet: string;
        if (unordered) {
          bullet = `\n${unordered[1]}${unordered[2]} `;
        } else {
          bullet = `\n${ordered![1]}${parseInt(ordered![2]) + 1}. `;
        }
        const newValue = value.slice(0, start) + bullet + value.slice(start);
        const newPos = start + bullet.length;
        onContentChange(newValue);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = newPos;
        });
      }
    }
  }, [onContentChange]);

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "var(--font-ui)" }}>

      {/* Title — shared across both panes */}
      <div className="px-8 pt-10 pb-5 border-b border-border shrink-0">
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled"
          style={{
            fontFamily: "var(--wf-editor-font)",
            fontSize: "calc(var(--wf-editor-size) * 1.85)",
            lineHeight: 1.2,
          }}
          className="w-full font-bold text-text-primary bg-transparent border-none outline-none placeholder:text-text-secondary/25 tracking-tight"
        />
      </div>

      {/* Split pane */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ── Write pane ── */}
        <div className="flex flex-col flex-1 min-w-0 border-r border-border">
          {/* Pane label */}
          <div className="flex items-center px-6 py-2 border-b border-border shrink-0">
            <span className="text-[10.5px] font-bold uppercase tracking-widest text-text-secondary">
              Markdown
            </span>
          </div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={"# Heading\n\nStart writing markdown here…"}
            spellCheck={false}
            className={[
              "flex-1 w-full resize-none bg-transparent outline-none p-6",
              "text-text-primary caret-accent leading-[1.75]",
              "placeholder:text-text-secondary/40",
            ].join(" ")}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13.5px",
              tabSize: 2,
            }}
          />
        </div>

        {/* ── Preview pane ── */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Pane label */}
          <div className="flex items-center px-6 py-2 border-b border-border shrink-0">
            <span className="text-[10.5px] font-bold uppercase tracking-widest text-text-secondary">
              Preview
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {content.trim() ? (
              <div className="tiptap-editor">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    img({ src, alt }) {
                      if (!src) return null;
                      // eslint-disable-next-line @next/next/no-img-element
                      return <img src={src} alt={alt ?? ""} style={{ maxWidth: "100%", height: "auto", borderRadius: "6px", margin: "0.5rem 0", display: "block" }} />;
                    },
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-text-secondary/40 text-[14px]" style={{ fontFamily: "var(--wf-editor-font)" }}>
                Preview will appear here…
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
