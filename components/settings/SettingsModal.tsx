"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  usePreferences,
  type FontFamily,
  type FontSize,
  type LineHeight,
  type ContentWidth,
  type EditorMode,
} from "@/lib/hooks/usePreferences";
import { THEMES, themeLabels, type Theme } from "@/lib/themes/tokens";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/auth-context";
import { signOutUser } from "@/lib/firebase/auth";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

type Tab = "appearance" | "editor" | "account";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors",
        checked ? "bg-accent" : "bg-border"
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}

function OptionRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-[13px] font-medium text-text-primary">{label}</span>
      <div className="flex items-center gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[12px] font-semibold transition-colors",
              value === opt.value
                ? "bg-accent text-white"
                : "bg-hover text-text-secondary hover:text-text-primary"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <div>
        <p className="text-[13px] font-medium text-text-primary">{label}</p>
        {description && <p className="text-[11.5px] text-text-secondary mt-0.5">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { user } = useAuth();
  const { prefs, updatePrefs } = usePreferences();
  const [tab, setTab] = useState<Tab>("appearance");

  const tabs: { id: Tab; label: string }[] = [
    { id: "appearance", label: "Appearance" },
    { id: "editor", label: "Editor" },
    { id: "account", label: "Account" },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-popup border-border max-w-[440px] p-0 overflow-hidden rounded-xl"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-[15px] font-bold text-text-primary">Settings</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-0.5 px-5 mt-3 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-3 py-2 text-[13px] font-semibold transition-colors border-b-2 -mb-px",
                tab === t.id
                  ? "border-accent text-accent"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="px-5 pb-5 pt-4 overflow-y-auto max-h-[60vh] space-y-5">

          {/* ── Appearance ── */}
          {tab === "appearance" && (
            <>
              <section>
                <p className="text-[10.5px] font-bold uppercase tracking-widest text-text-secondary mb-3">Theme</p>
                <div className="grid grid-cols-5 gap-2">
                  {THEMES.map((theme: Theme) => (
                    <button
                      key={theme}
                      onClick={() => updatePrefs({ theme })}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-1.5 rounded-lg border-2 transition-all",
                        prefs.theme === theme ? "border-accent" : "border-transparent hover:border-border"
                      )}
                    >
                      <ThemeSwatch theme={theme} />
                      <span className="text-[10px] font-medium text-text-secondary leading-none">
                        {themeLabels[theme]}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <p className="text-[10.5px] font-bold uppercase tracking-widest text-text-secondary mb-1">Typography</p>
                <OptionRow
                  label="Font"
                  value={prefs.fontFamily}
                  onChange={(v: FontFamily) => updatePrefs({ fontFamily: v })}
                  options={[
                    { value: "serif", label: "Serif" },
                    { value: "sans", label: "Sans" },
                    { value: "mono", label: "Mono" },
                  ]}
                />
                <OptionRow
                  label="Size"
                  value={prefs.fontSize}
                  onChange={(v: FontSize) => updatePrefs({ fontSize: v })}
                  options={[
                    { value: "small", label: "S" },
                    { value: "medium", label: "M" },
                    { value: "large", label: "L" },
                  ]}
                />
                <OptionRow
                  label="Line height"
                  value={prefs.lineHeight}
                  onChange={(v: LineHeight) => updatePrefs({ lineHeight: v })}
                  options={[
                    { value: "compact", label: "Compact" },
                    { value: "normal", label: "Normal" },
                    { value: "relaxed", label: "Relaxed" },
                  ]}
                />
                <OptionRow
                  label="Width"
                  value={prefs.contentWidth}
                  onChange={(v: ContentWidth) => updatePrefs({ contentWidth: v })}
                  options={[
                    { value: "narrow", label: "Narrow" },
                    { value: "medium", label: "Medium" },
                    { value: "wide", label: "Wide" },
                  ]}
                />
              </section>
            </>
          )}

          {/* ── Editor ── */}
          {tab === "editor" && (
            <>
              <section>
                <p className="text-[10.5px] font-bold uppercase tracking-widest text-text-secondary mb-2">Editor mode</p>
                <div className="grid grid-cols-2 gap-2">
                  {([ "journaling", "markdown" ] as EditorMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updatePrefs({ editorMode: mode })}
                      className={cn(
                        "flex flex-col gap-1.5 p-3 rounded-xl border-2 text-left transition-all",
                        prefs.editorMode === mode
                          ? "border-accent bg-accent/[0.06]"
                          : "border-border hover:border-text-secondary/30 bg-hover"
                      )}
                    >
                      <span className={cn(
                        "text-[13px] font-semibold",
                        prefs.editorMode === mode ? "text-accent" : "text-text-primary"
                      )}>
                        {mode === "journaling" ? "Journaling" : "Markdown"}
                      </span>
                      <span className="text-[11.5px] font-normal text-text-secondary leading-snug">
                        {mode === "journaling"
                          ? "Markdown renders live as you type. No raw syntax visible."
                          : "Write raw markdown on the left, see the preview on the right."}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <p className="text-[10.5px] font-bold uppercase tracking-widest text-text-secondary mb-1">Behaviour</p>
                <ToggleRow
                  label="Focus mode by default"
                  description="Open every document in focus mode."
                  checked={prefs.focusModeDefault}
                  onChange={(v) => updatePrefs({ focusModeDefault: v })}
                />
                <ToggleRow
                  label="Typewriter mode"
                  description="Keep the active line centred vertically."
                  checked={prefs.typwriterMode}
                  onChange={(v) => updatePrefs({ typwriterMode: v })}
                />
              </section>
            </>
          )}

          {/* ── Account ── */}
          {tab === "account" && (
            <section>
              <p className="text-[10.5px] font-bold uppercase tracking-widest text-text-secondary mb-3">Profile</p>
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-hover">
                <div className="flex items-center gap-3 min-w-0">
                  {user?.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photoURL} alt="" className="size-9 rounded-full shrink-0" />
                  ) : (
                    <div className="size-9 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-accent">
                        {user?.displayName?.[0]?.toUpperCase() ?? "?"}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-text-primary truncate">{user?.displayName}</p>
                    <p className="text-[12px] font-normal text-text-secondary truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { signOutUser(); onClose(); }}
                  className="text-[12px] font-semibold text-destructive hover:opacity-75 transition-opacity shrink-0"
                >
                  Sign out
                </button>
              </div>
            </section>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}

const swatchColors: Record<Theme, { bg: string; line: string; dot: string }> = {
  light:     { bg: "#ffffff", line: "#d1d0cc", dot: "#1a6bcf" },
  dark:      { bg: "#1c1c1c", line: "#3a3a3a", dot: "#4f9eff" },
  sepia:     { bg: "#f0e8d6", line: "#c8b99a", dot: "#b05528" },
  nord:      { bg: "#373e4d", line: "#5a647a", dot: "#81c0d0" },
  solarized: { bg: "#073642", line: "#1e5564", dot: "#2d9cd4" },
};

function ThemeSwatch({ theme }: { theme: Theme }) {
  const c = swatchColors[theme];
  return (
    <div className="w-10 h-7 rounded-md overflow-hidden border border-border/50" style={{ background: c.bg }}>
      <div className="mx-1.5 mt-1.5 space-y-1">
        <div className="h-1 rounded-full" style={{ background: c.line }} />
        <div className="h-1 w-2/3 rounded-full" style={{ background: c.dot }} />
      </div>
    </div>
  );
}
