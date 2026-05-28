"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/firebase/auth-context";

interface LayoutState {
  sidebarCollapsed: boolean;
  docListCollapsed: boolean;
}

const DEFAULTS: LayoutState = {
  sidebarCollapsed: false,
  docListCollapsed: false,
};

export function useLayout() {
  const { user } = useAuth();
  const [layout, setLayout] = useState<LayoutState>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.uid, "layout", "default");
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        setLayout(snap.data() as LayoutState);
      }
      setReady(true);
    });
  }, [user]);

  const update = useCallback(
    async (patch: Partial<LayoutState>) => {
      if (!user) return;
      const next = { ...layout, ...patch };
      setLayout(next);
      await setDoc(doc(db, "users", user.uid, "layout", "default"), next);
    },
    [user, layout]
  );

  const toggleSidebar = useCallback(
    () => update({ sidebarCollapsed: !layout.sidebarCollapsed }),
    [update, layout.sidebarCollapsed]
  );

  const toggleDocList = useCallback(
    () => update({ docListCollapsed: !layout.docListCollapsed }),
    [update, layout.docListCollapsed]
  );

  return { layout, ready, toggleSidebar, toggleDocList };
}
