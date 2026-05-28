"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/firebase/auth-context";
import type { WFFolder } from "@/lib/types";

export function useFolders() {
  const { user } = useAuth();
  const [folders, setFolders] = useState<WFFolder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "folders"),
      orderBy("order", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setFolders(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as WFFolder))
      );
      setLoading(false);
    });

    return unsub;
  }, [user]);

  const createFolder = useCallback(
    async (name: string) => {
      if (!user) return null;
      const ref = await addDoc(collection(db, "users", user.uid, "folders"), {
        name,
        createdAt: serverTimestamp(),
        order: folders.length,
      });
      return ref.id;
    },
    [user, folders.length]
  );

  const renameFolder = useCallback(
    async (folderId: string, name: string) => {
      if (!user) return;
      await updateDoc(doc(db, "users", user.uid, "folders", folderId), { name });
    },
    [user]
  );

  const deleteFolder = useCallback(
    async (folderId: string) => {
      if (!user) return;
      await deleteDoc(doc(db, "users", user.uid, "folders", folderId));
    },
    [user]
  );

  return { folders, loading, createFolder, renameFolder, deleteFolder };
}
