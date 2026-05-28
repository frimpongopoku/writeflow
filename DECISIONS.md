# WriteFlow — Decision Log

## [Setup] Use Tailwind v4 (CSS-first config)
**Decision:** The scaffolded Next.js 15 project uses Tailwind v4, which has no `tailwind.config.ts`. Theme tokens are defined via `@theme inline` in `globals.css` and referenced as CSS custom properties.
**Reason:** `create-next-app` installs Tailwind v4 by default as of May 2026. No config file regression needed.
**Date:** 2026-05-28

## [Setup] Theme tokens as `--wf-*` CSS custom properties on `[data-theme]`
**Decision:** All theme colors are defined as `--wf-background`, `--wf-surface`, `--wf-border`, `--wf-text-primary`, `--wf-text-secondary`, `--wf-accent` on `[data-theme="X"]` attributes, mapped to Tailwind color tokens via `@theme inline`.
**Reason:** Spec requires themes applied via `data-theme` on `<html>`. The `--wf-` prefix avoids collisions with shadcn's own `--background` / `--foreground` variables.
**Date:** 2026-05-28

## [Setup] Editor fonts loaded in root layout
**Decision:** Lora (serif), Inter (sans-serif), JetBrains Mono (monospace) are loaded via `next/font/google` in `app/layout.tsx` and exposed as CSS variables (`--font-lora`, `--font-inter`, `--font-jetbrains-mono`).
**Reason:** Spec requires three font family options in typography settings. Loading at root avoids per-component font flashes.
**Date:** 2026-05-28

## [Themes] Typography applied via CSS custom properties on `<html>`
**Decision:** `ThemeApplier` sets `--wf-editor-font`, `--wf-editor-size`, `--wf-editor-line-height`, and `--wf-content-width` directly on `document.documentElement.style` on every preferences change.
**Reason:** CSS variables cascade instantly without re-rendering any React components. Avoids passing prefs as props through the whole tree.
**Date:** 2026-05-28

## [Editor] Custom floating toolbar — no BubbleMenu React component in Tiptap v3
**Decision:** FloatingToolbar is built from scratch using `useEditorState` (to detect selection) and `window.getSelection().getRangeAt(0).getBoundingClientRect()` (to position the toolbar), rendered via a React portal into `document.body`.
**Reason:** In Tiptap v3, `BubbleMenu` is only a raw ProseMirror plugin (`@tiptap/extension-bubble-menu`), not a React component. The equivalent React component was removed in v3.
**Date:** 2026-05-28

## [Editor] Auto-save is debounced 2 s, shares the same timer for title and content changes
**Decision:** A single `saveTimer` ref covers both title input changes and editor content changes. Either event resets the 2-second countdown.
**Reason:** Prevents two simultaneous Firestore writes if the user edits the title and then the body in quick succession.
**Date:** 2026-05-28

## [Editor] `key={docId}` forces full editor remount on doc navigation
**Decision:** The `<Editor key={docId} />` prop causes React to unmount/remount the component when the user navigates to a different document.
**Reason:** Tiptap's `useEditor` does not cleanly reset content via `setContent` after initial mount when switching documents; remounting is simpler and avoids stale editor state.
**Date:** 2026-05-28

## [Data] All documents fetched once, filtered client-side
**Decision:** `useDocuments` subscribes to all user documents via a single `onSnapshot` query (ordered by `updatedAt desc`), then filters by folderId in memory.
**Reason:** Avoids Firestore composite index requirements for multi-field queries. Writing apps won't accumulate thousands of docs, so client-side filtering is fast enough.
**Date:** 2026-05-28

## [Data] Virtual folders use reserved IDs `__all__` and `__trash__`
**Decision:** "All Documents" and "Trash" are not Firestore documents — they are handled by the URL using the reserved strings `__all__` and `__trash__` as folderId params.
**Reason:** Keeps the sidebar navigation uniform (single `router.push(/dashboard/[folderId])` pattern) without special-casing the URL shape.
**Date:** 2026-05-28

## [Auth] Client-side auth guard in dashboard layout
**Decision:** Auth protection is handled by a `useEffect` redirect in `app/dashboard/layout.tsx`, not Next.js middleware.
**Reason:** Firebase Auth is client-side only — `onAuthStateChanged` is async and cannot run in Edge middleware. A layout-level guard is the correct pattern for Firebase + App Router.
**Date:** 2026-05-28

## [Auth] User preferences/layout stored as subcollection documents at `preferences/default` and `layout/default`
**Decision:** User prefs live at `users/{uid}/preferences/default` and `users/{uid}/layout/default`.
**Reason:** Firestore schema shows `preferences/` and `layout/` as subcollections. Using a fixed document ID `"default"` keeps reads/writes simple without requiring a query.
**Date:** 2026-05-28

## [Auth] Profile initialised on first `onAuthStateChanged` — not in sign-in flow
**Decision:** `initUserProfile` runs inside the `AuthProvider`'s `onAuthStateChanged` callback, not inside `signInWithGoogle`.
**Reason:** Ensures profile is always created even if the sign-in callback is interrupted, and idempotently skips creation on subsequent logins.
**Date:** 2026-05-28

## [Setup] Use sonner instead of shadcn toast
**Decision:** Using `sonner` (via `components/ui/sonner.tsx`) rather than the deprecated shadcn `toast` component.
**Reason:** shadcn CLI flagged `toast` as deprecated and recommends `sonner`.
**Date:** 2026-05-28
