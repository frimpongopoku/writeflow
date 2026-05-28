"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "./auth";
import { db } from "./firestore";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

const WELCOME_CONTENT = `## Welcome to WriteFlow 👋

This is your writing space. It stays out of your way so you can focus on what matters.

### Getting started

- **Create a folder** using the + button next to "Folders" in the sidebar
- **Create a document** using the + button in the document list
- **Format with markdown** — type \`**bold**\`, \`*italic*\`, \`# Heading\` and it renders live

### Keyboard shortcuts

| Action | Shortcut |
|---|---|
| Bold | ⌘B |
| Italic | ⌘I |
| Focus mode | ⌘⇧F |
| New document | Click + in doc list |

### Themes & fonts

Open **Settings** (gear icon, bottom-left) to switch themes, change the font, or adjust line height and content width.

---

Happy writing.
`;

async function initUserProfile(user: User) {
  const prefsRef = doc(db, "users", user.uid, "preferences", "default");
  const layoutRef = doc(db, "users", user.uid, "layout", "default");

  const [prefsSnap, layoutSnap] = await Promise.all([
    getDoc(prefsRef),
    getDoc(layoutRef),
  ]);

  const writes: Promise<void>[] = [];
  const isNewUser = !prefsSnap.exists();

  if (isNewUser) {
    writes.push(
      setDoc(prefsRef, {
        theme: "light",
        fontFamily: "serif",
        fontSize: "medium",
        lineHeight: "normal",
        contentWidth: "medium",
        focusModeDefault: false,
        typwriterMode: false,
        createdAt: serverTimestamp(),
      })
    );
  }

  if (!layoutSnap.exists()) {
    writes.push(
      setDoc(layoutRef, {
        sidebarCollapsed: false,
        docListCollapsed: false,
      })
    );
  }

  // Seed a "Getting Started" folder + welcome doc for brand-new users
  if (isNewUser) {
    const { addDoc, collection } = await import("firebase/firestore");
    const folderRef = await addDoc(collection(db, "users", user.uid, "folders"), {
      name: "Getting Started",
      createdAt: serverTimestamp(),
      order: 0,
    });
    writes.push(
      addDoc(collection(db, "users", user.uid, "documents"), {
        folderId: folderRef.id,
        title: "Welcome to WriteFlow",
        content: WELCOME_CONTENT,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        wordCount: 80,
        isDeleted: false,
        deletedAt: null,
      }).then(() => {})
    );
  }

  await Promise.all(writes);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await initUserProfile(firebaseUser);
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
