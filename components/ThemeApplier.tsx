"use client";

import { useEffect } from "react";
import {
  usePreferences,
  type FontFamily,
  type FontSize,
  type LineHeight,
  type ContentWidth,
} from "@/lib/hooks/usePreferences";

const fontVarMap: Record<FontFamily, string> = {
  serif: "var(--font-serif)",
  sans: "var(--font-sans-alt)",
  mono: "var(--font-mono)",
};

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
    // Cache for the anti-flash inline script in layout.tsx
    try { localStorage.setItem("wf-theme", JSON.stringify(prefs.theme)); } catch (_) {}
    root.style.setProperty("--wf-editor-font", fontVarMap[prefs.fontFamily]);
    root.style.setProperty("--wf-editor-size", fontSizeMap[prefs.fontSize]);
    root.style.setProperty("--wf-editor-line-height", lineHeightMap[prefs.lineHeight]);
    root.style.setProperty("--wf-content-width", contentWidthMap[prefs.contentWidth]);
  }, [prefs, ready]);

  return null;
}
