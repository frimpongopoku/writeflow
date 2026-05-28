# Claude Instructions — WriteFlow

## What You Are Building
A WYSIWYG markdown writing app. Full spec is in `writeflow-spec.md`. Read it fully before writing any code.

## How to Work

**Build one section at a time.** Do not attempt to scaffold the entire app in one response. Complete each piece properly before moving to the next. Suggested order:
1. Project setup + Firebase config
2. Auth (Google Sign-In, protected routes)
3. Layout (three-panel shell, collapsible panels)
4. Firestore hooks (folders, documents CRUD)
5. Editor (Tiptap + markdown rendering)
6. Auto-save
7. Themes + typography settings
8. Focus mode
9. Floating toolbar + AI actions
10. Export (download `.md`, copy to clipboard)
11. Stats bar
12. Settings panel
13. Onboarding / empty states

**Ask before assuming.** If something in the spec is ambiguous, ask one focused question before writing code. Do not guess and build the wrong thing.

**Do not over-generate.** Write only the code needed for the current task. No placeholder files, no stubbed-out future features, no TODO comments for things outside the current scope.

## Hard Rules

- **No blur effects.** Never use `backdrop-filter: blur`, `filter: blur`, or any frosted glass pattern. Use solid backgrounds + shadows instead. This is a performance requirement, not a style preference.
- **No `any` types in TypeScript.** Type everything properly.
- **Server-side AI calls only.** The Anthropic API key must never be referenced in client-side code. All AI calls go through `/api/ai/` Next.js route handlers.
- **No inline styles.** Use Tailwind classes exclusively. Custom values go in `tailwind.config.ts`.
- **Firestore writes are debounced.** Auto-save triggers 2 seconds after the user stops typing. Never write on every keystroke.
- **Google Auth only.** Do not add email/password or any other provider.

## Stack
- Next.js (App Router)
- Tailwind CSS
- shadcn/ui
- Firebase Auth + Firestore
- Tiptap editor (`@tiptap/extension-markdown`)
- Anthropic SDK (server-side only)
- Lucide React (icons)

## Firestore Schema
Treat this as authoritative. Do not change field names or collection paths.

```
users/{userId}
  preferences/
    - theme: string
    - fontFamily: string
    - fontSize: string
    - lineHeight: string
    - contentWidth: string
    - focusModeDefault: boolean
    - typwriterMode: boolean
  layout/
    - sidebarCollapsed: boolean
    - docListCollapsed: boolean

  folders/{folderId}
    - name: string
    - createdAt: timestamp
    - order: number

  documents/{documentId}
    - folderId: string
    - title: string
    - content: string
    - createdAt: timestamp
    - updatedAt: timestamp
    - wordCount: number
    - isDeleted: boolean
    - deletedAt: timestamp | null
```

## Themes
Implement as CSS custom properties on `[data-theme]` attribute on `<html>`. Tailwind reads from these variables. Five themes: `light`, `dark`, `sepia`, `nord`, `solarized`. Each theme defines background, surface, border, text-primary, text-secondary, and accent color tokens.

## Editor Rules
- Use Tiptap with `@tiptap/extension-markdown`
- Content width: max ~680px, centered in the editor panel
- The document title is a separate `<input>` or `contenteditable` above the Tiptap instance, not part of the editor content
- Floating toolbar renders via Tiptap's `BubbleMenu` extension — appears on text selection only
- Stats bar lives outside Tiptap, reads from `editor.storage` or `editor.getText()`

## AI Action Format
When calling the AI API route, send:
```json
{
  "action": "rephrase | summarise | fix_grammar | make_shorter | make_longer | continue | tone_formal | tone_casual",
  "selectedText": "...",
  "context": "up to 300 chars before the selection for context"
}
```
Return:
```json
{
  "result": "..."
}
```
Keep system prompts short and specific per action. Do not send the entire document to the API — only `selectedText` and minimal surrounding `context`.

## Component Structure
```
/app
  /auth/page.tsx
  /dashboard/layout.tsx
  /dashboard/[folderId]/[docId]/page.tsx
/components
  /editor/Editor.tsx
  /editor/FloatingToolbar.tsx
  /editor/StatsBar.tsx
  /editor/AIPopover.tsx
  /sidebar/Sidebar.tsx
  /sidebar/FolderList.tsx
  /doclist/DocList.tsx
  /doclist/DocCard.tsx
  /settings/SettingsModal.tsx
  /ui/  ← shadcn components live here
/lib
  /firebase/config.ts
  /firebase/auth.ts
  /firebase/firestore.ts
  /hooks/useDocument.ts
  /hooks/useFolders.ts
  /hooks/usePreferences.ts
  /themes/tokens.ts
/app/api
  /ai/route.ts
```

## Decision Memory

Maintain a running `DECISIONS.md` file in the project root. Every time a non-trivial implementation decision is made — a library chosen, a pattern adopted, a spec ambiguity resolved, a trade-off accepted — log it immediately in this format:

```
## [Section] Short title
**Decision:** What was decided.
**Reason:** Why.
**Date:** YYYY-MM-DD
```

Examples of things that must be logged:
- Choosing Tiptap over Milkdown (and why)
- How theme tokens are structured in CSS
- How the auto-save debounce is implemented
- Any deviation from the spec, however small
- Any library version pinned due to a compatibility issue
- How Firestore security rules are structured

At the start of every new conversation or task, read `DECISIONS.md` before writing any code. This is how continuity is maintained across sessions. Never re-litigate a logged decision unless explicitly asked to revisit it.

---

## What Good Output Looks Like
- Code compiles and runs without modification
- No missing imports
- No hardcoded user IDs or test values left in
- Firestore rules not bypassed (reads/writes are user-scoped)
- Each component has a single clear responsibility
- No component exceeds ~200 lines — split if needed
