"use client";

import { useEffect } from "react";
import {
  usePreferences,
  type FontFamily,
  type FontSize,
  type LineHeight,
  type ContentWidth,
} from "@/lib/hooks/usePreferences";

// "default" = Crimson Pro — beautiful serif that ships as the writing default
const fontVarMap: Record<FontFamily, string> = {
  serif: "var(--font-serif)",           // Lora
  sans: "var(--font-sans-alt)",         // DM Sans
  mono: "var(--font-mono)",             // JetBrains Mono
};

// Crimson Pro is an optical-size serif — 18px reads like 16px in sans
const fontSizeMap: Record<FontSize, string> = {
  small: "16px",
  medium: "18px",
  large: "21px",
};

const lineHeightMap: Record<LineHeight, string> = {
  compact: "1.6",
  normal: "1.8",
  relaxed: "2.1",
};

const contentWidthMap: Record<ContentWidth, string> = {
  narrow: "580px",
  medium: "680px",
  wide: "800px",
};

export function ThemeApplier() {
  const { prefs, ready } = usePreferences();

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.setAttribute("data-theme", prefs.theme);
    // "default" serif ships as Crimson Pro (set in CSS :root); only override for explicit choices
    root.style.setProperty("--wf-editor-font", fontVarMap[prefs.fontFamily]);
    root.style.setProperty("--wf-editor-size", fontSizeMap[prefs.fontSize]);
    root.style.setProperty("--wf-editor-line-height", lineHeightMap[prefs.lineHeight]);
    root.style.setProperty("--wf-content-width", contentWidthMap[prefs.contentWidth]);
  }, [prefs, ready]);

  return null;
}
