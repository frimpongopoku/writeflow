"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/firebase/auth-context";
import { VIRTUAL_FOLDER_ALL, VIRTUAL_FOLDER_TRASH, type WFDocument } from "@/lib/types";

export function useDocuments(folderId: string | null) {
  const { user } = useAuth();
  const [allDocs, setAllDocs] = useState<WFDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "documents"),
      orderBy("updatedAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setAllDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as WFDocument)));
      setLoading(false);
    });

    return unsub;
  }, [user]);

  const documents = folderId
    ? allDocs.filter((d) => {
        if (folderId === VIRTUAL_FOLDER_TRASH) return d.isDeleted;
        if (folderId === VIRTUAL_FOLDER_ALL) return !d.isDeleted;
        return d.folderId === folderId && !d.isDeleted;
      })
    : [];

  const createDocument = useCallback(
    async (targetFolderId: string) => {
      if (!user) return null;
      const ref = await addDoc(collection(db, "users", user.uid, "documents"), {
        folderId: targetFolderId,
        title: "",
        content: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        wordCount: 0,
        isDeleted: false,
        deletedAt: null,
      });
      return ref.id;
    },
    [user]
  );

  const softDeleteDocument = useCallback(
    async (docId: string) => {
      if (!user) return;
      await updateDoc(doc(db, "users", user.uid, "documents", docId), {
        isDeleted: true,
        deletedAt: serverTimestamp(),
      });
    },
    [user]
  );

  const restoreDocument = useCallback(
    async (docId: string) => {
      if (!user) return;
      await updateDoc(doc(db, "users", user.uid, "documents", docId), {
        isDeleted: false,
        deletedAt: null,
      });
    },
    [user]
  );

  return { documents, loading, createDocument, softDeleteDocument, restoreDocument };
}
