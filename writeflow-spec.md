# WriteFlow — Product Specification v1.0

> A beautiful, distraction-free markdown writing app for the web.

---

## 1. Overview

WriteFlow is a web-based WYSIWYG markdown writing app built for serious writers. The core promise is a top-tier writing experience: markdown renders live as you type, the interface stays out of your way, and everything persists reliably in the cloud. Inspired by Bear, but built for the web and available to everyone.

**Stack:** Next.js · Tailwind CSS · shadcn/ui · Firebase Auth (Google) · Firestore

---

## 2. User Authentication

- **Google Sign-In only** via Firebase Auth
- On first login, a user profile document is created in Firestore
- Auth state persists across sessions (no repeated logins)
- Unauthenticated users are redirected to a clean landing/login page
- No email/password, no other providers

---

## 3. App Layout

Three-panel layout, similar to Bear:

```
┌─────────────┬──────────────────┬────────────────────────────┐
│  Sidebar    │   Document List  │        Editor              │
│  (220px)    │   (280px)        │     (remaining width)      │
│             │                  │                            │
│  - Logo     │  - Search bar    │  - Full WYSIWYG editor     │
│  - Folders  │  - New doc btn   │  - Title at top            │
│  - Settings │  - Doc cards     │  - Stats bar (bottom)      │
└─────────────┴──────────────────┴────────────────────────────┘
```

- Sidebar and Document List are **collapsible** individually
- **Focus Mode**: hides both panels, leaves only the editor
- Layout state (collapsed panels) persists per user in Firestore
- Fully responsive — on mobile, panels stack and navigate as separate views

---

## 4. Document Management

### Folders
- Users can create, rename, and delete folders
- Documents live inside folders (one folder per document)
- A default **"All Documents"** view shows everything
- A **"Trash"** folder holds deleted documents (soft delete, 30-day auto-purge)
- Folder order is drag-and-droppable
- Folders and document counts shown in sidebar

### Document List
- Each card shows: title, first line of content (preview), last edited date
- Sorted by last edited (most recent first) by default
- Search bar filters across all document titles and content (client-side for v1)
- "New Document" button creates an untitled doc in the current folder

### Document Storage (Firestore Schema)
```
users/{userId}
  folders/{folderId}
    - name: string
    - createdAt: timestamp
    - order: number

  documents/{documentId}
    - folderId: string
    - title: string
    - content: string (raw markdown)
    - createdAt: timestamp
    - updatedAt: timestamp
    - wordCount: number
    - isDeleted: boolean
    - deletedAt: timestamp | null
```

---

## 5. The Editor

This is the heart of the app. The writing experience must feel fast, clean, and beautiful.

### 5.1 WYSIWYG Markdown Rendering
- Markdown renders **live as you type** — no split pane, no preview toggle
- Users write raw markdown; formatting is applied instantly inline
- Supported markdown elements:
  - Headings (H1–H3 via `#`, `##`, `###`)
  - Bold (`**text**`), Italic (`*text*`), Strikethrough (`~~text~~`)
  - Inline code (`` `code` ``) and code blocks (` ``` `)
  - Blockquotes (`> text`)
  - Unordered and ordered lists
  - Horizontal rules (`---`)
  - Links (`[label](url)`)
  - Tables (GFM-style)
- Recommended library: **Tiptap** (with markdown extension) or **Milkdown**

### 5.2 Editor UX Details
- Document **title** is a plain text field at the top (large, prominent)
- Title auto-saves as part of the document
- Cursor is always a clean text cursor — no UI chrome in the way
- Soft wrap at a comfortable reading width (~680px content width), centered
- Smooth scrolling
- No toolbar visible by default — formatting is done via markdown syntax or keyboard shortcuts

### 5.3 Keyboard Shortcuts
| Action | Shortcut |
|---|---|
| Bold | `Cmd/Ctrl + B` |
| Italic | `Cmd/Ctrl + I` |
| Strikethrough | `Cmd/Ctrl + Shift + S` |
| Inline code | `Cmd/Ctrl + E` |
| Heading 1 | `Cmd/Ctrl + 1` |
| Heading 2 | `Cmd/Ctrl + 2` |
| Heading 3 | `Cmd/Ctrl + 3` |
| Toggle Focus Mode | `Cmd/Ctrl + Shift + F` |
| New Document | `Cmd/Ctrl + N` |
| Search | `Cmd/Ctrl + K` |

### 5.4 Format Toolbar (Context)
- A minimal floating toolbar appears **only when text is selected**
- Options: Bold · Italic · Strikethrough · Inline Code · Link
- Disappears when selection is cleared
- No permanent toolbar cluttering the writing surface

### 5.5 Auto-Save
- Document auto-saves to Firestore **2 seconds after the user stops typing**
- A subtle "Saved" / "Saving..." indicator in the stats bar
- No manual save button required

### 5.6 Stats Bar
- Displayed at the bottom of the editor, always visible
- Shows: **Word Count** · **Character Count** · **Read Time** (estimated at 200 wpm)
- Updates live as user types

---

## 6. Focus Mode

- Triggered via keyboard shortcut or a button in the editor toolbar
- Hides: sidebar, document list
- Dims everything outside the current paragraph (typewriter-style optional enhancement)
- Editor content stays centered at comfortable reading width
- A small exit button or same shortcut to leave focus mode
- Focus mode state persists in user preferences

---

## 7. Themes & Appearance

Themes are a **core part of the experience** — the app should feel beautiful across all of them.

### 7.1 Available Themes
| Theme | Description |
|---|---|
| **Light** | Clean white, high contrast |
| **Dark** | Deep dark background, easy on the eyes |
| **Sepia** | Warm cream tones, paper-like feel |
| **Nord** | Cool blue-grey tones |
| **Solarized** | Muted, warm amber-accented dark |

### 7.2 Typography Settings
Users can configure (persisted per user in Firestore):
- **Font family**: Serif (e.g. Lora), Sans-serif (e.g. Inter), Monospace (e.g. JetBrains Mono)
- **Font size**: Small / Medium / Large
- **Line height**: Compact / Normal / Relaxed
- **Content width**: Narrow / Medium / Wide

### 7.3 Theme Persistence
- All theme and typography preferences saved to Firestore under the user profile
- Applied immediately on login, no flash of unstyled content

---

## 8. AI Writing Assistant

AI features are accessible but **never intrusive**. The writer is always in control.

### 8.1 Trigger
- Select any text → the floating toolbar appears
- The toolbar includes an **"AI"** button (sparkle icon) at the end
- Clicking it opens a small popover menu with AI actions

### 8.2 Available AI Actions
| Action | Description |
|---|---|
| **Summarise** | Condense the selected text into a shorter version |
| **Rephrase** | Rewrite the selection in a different way, same meaning |
| **Fix Grammar** | Correct grammatical errors in the selection |
| **Make Shorter** | Trim the selection down |
| **Make Longer** | Expand the selection with more detail |
| **Continue Writing** | Generate a continuation from the cursor position |
| **Change Tone → Formal** | Rewrite in a formal tone |
| **Change Tone → Casual** | Rewrite in a casual tone |

### 8.3 UX Flow
1. User selects text → floating toolbar appears
2. User clicks AI button → popover menu shows actions
3. User picks an action → a loading state appears inline
4. Result appears in a **diff-style preview**: original greyed out, suggestion shown below
5. User clicks **Accept** (replaces text) or **Discard** (keeps original)
6. For "Continue Writing", result is appended after the cursor with an Accept/Discard option

### 8.4 Implementation
- Powered by the Anthropic API (Claude)
- API calls made server-side via Next.js API routes (API key never exposed to client)
- Reasonable rate limiting applied per user

---

## 9. Export Options

Accessible from a menu in the editor header (three-dot or similar):

| Option | Behaviour |
|---|---|
| **Download as Markdown** | Downloads the raw `.md` file with the document title as filename |
| **Copy to Clipboard** | Copies the raw markdown content to clipboard, shows a brief "Copied!" toast |

---

## 10. Settings Panel

Accessible from the sidebar (gear icon). A modal or slide-over panel with sections:

- **Appearance**: Theme selection, font, size, line height, content width
- **Account**: Display name, profile photo (from Google), sign out button
- **Editor**: Toggle typewriter mode (scrolls current line to center), toggle focus mode default

---

## 11. Empty & Onboarding States

- **New user**: A welcome document is pre-created in a "Getting Started" folder with a brief guide on markdown syntax and app shortcuts
- **Empty folder**: Clean empty state with a "Create your first document" CTA
- **Empty document**: Placeholder hint text in the editor ("Start writing...")

---

## 12. UI Performance Constraints

- **No blur effects anywhere** — no `backdrop-filter: blur`, no `filter: blur`, no frosted glass effects. Use solid backgrounds with opacity or border/shadow instead. Blur causes page-wide rendering lag and is banned from the entire UI.

---

## 13. Non-Goals for v1

These are explicitly out of scope to keep v1 focused:

- Real-time collaboration / multiplayer editing
- Comments or annotations
- Version history / document snapshots
- Image uploads inside documents
- Mobile app (web-responsive only)
- Offline support
- Custom domain / publishing
- Backlinks between documents
- PDF export

---

## 13. Technical Notes

### Next.js Structure
```
/app
  /auth         → Login page
  /dashboard    → Main app layout (authenticated)
    /[folderId]
      /[docId]  → Editor view
/components
  /editor       → Tiptap/Milkdown editor components
  /sidebar      → Folder nav
  /doclist      → Document list panel
  /ai           → AI toolbar and popover
  /settings     → Settings modal
/lib
  /firebase     → Auth + Firestore config
  /ai           → Anthropic API call helpers
/api
  /ai           → Server-side AI route handlers
```

### Key Libraries
| Purpose | Library |
|---|---|
| Editor | Tiptap (with `@tiptap/extension-markdown`) |
| UI Components | shadcn/ui |
| Styling | Tailwind CSS |
| Auth | Firebase Auth |
| Database | Firestore |
| AI | Anthropic SDK (server-side) |
| Icons | Lucide React |

---

*Spec version 1.0 — ready for development*
