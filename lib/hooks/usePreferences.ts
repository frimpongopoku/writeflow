"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/firebase/auth-context";
import type { Theme } from "@/lib/themes/tokens";

export type FontFamily = "sans" | "serif" | "mono";
export type FontSize = "small" | "medium" | "large";
export type LineHeight = "compact" | "normal" | "relaxed";
export type ContentWidth = "narrow" | "medium" | "wide";
export type EditorMode = "journaling" | "markdown";

export interface Preferences {
  theme: Theme;
  fontFamily: FontFamily;
  fontSize: FontSize;
  lineHeight: LineHeight;
  contentWidth: ContentWidth;
  focusModeDefault: boolean;
  typwriterMode: boolean;
  editorMode: EditorMode;
}

const DEFAULTS: Preferences = {
  theme: "light",
  fontFamily: "sans",
  fontSize: "medium",
  lineHeight: "normal",
  contentWidth: "medium",
  focusModeDefault: false,
  typwriterMode: false,
  editorMode: "journaling",
};

export function usePreferences() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.uid, "preferences", "default");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setPrefs({ ...DEFAULTS, ...(snap.data() as Partial<Preferences>) });
      }
      setReady(true);
    });

    return unsub;
  }, [user]);

  const updatePrefs = useCallback(
    async (patch: Partial<Preferences>) => {
      if (!user) return;
      const next = { ...prefs, ...patch };
      setPrefs(next);
      await setDoc(doc(db, "users", user.uid, "preferences", "default"), next);
    },
    [user, prefs]
  );

  return { prefs, ready, updatePrefs };
}
