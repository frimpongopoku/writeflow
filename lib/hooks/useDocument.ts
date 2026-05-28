"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/firebase/auth-context";
import type { WFDocument } from "@/lib/types";

export function useDocument(docId: string | null) {
  const { user } = useAuth();
  const [document, setDocument] = useState<WFDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !docId) {
      setDocument(null);
      setLoading(false);
      return;
    }

    const ref = doc(db, "users", user.uid, "documents", docId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setDocument({ id: snap.id, ...snap.data() } as WFDocument);
      } else {
        setDocument(null);
      }
      setLoading(false);
    });

    return unsub;
  }, [user, docId]);

  const updateDocument = useCallback(
    async (patch: Partial<Pick<WFDocument, "title" | "content" | "wordCount">>) => {
      if (!user || !docId) return;
      await updateDoc(doc(db, "users", user.uid, "documents", docId), {
        ...patch,
        updatedAt: serverTimestamp(),
      });
    },
    [user, docId]
  );

  return { document, loading, updateDocument };
}
