# Implementation Plan: Feature 6.7 — Public & Private Chat Split

## Context

The existing chat system has a single knowledge base, single route (`/chat`), and single API endpoint. This feature splits it into two separate chat experiences: a **Public CMO** for visitors and a **Private CMO** for internal team use. Each has its own knowledge base — public excludes `Sales_Pitches` and `FloDesk Emails`.

**Depends on**: Features 6.1–6.5 (all complete and deployed)

---

## Critical Design Decisions

### 1. Two Knowledge Bases, One Build

The build script processes Train_CMO once but writes two outputs. Documents are filtered by category at the output stage, not during processing. This avoids re-reading files twice.

### 2. Knowledge Base Directory Structure

```
public/knowledge-base/
├── public/
│   ├── manifest.json      (excludes Sales_Pitches + FloDesk Emails)
│   └── chunks.json
└── private/
    ├── manifest.json      (all 12 categories)
    └── chunks.json
```

The old root-level `chunks.json` and `manifest.json` are removed.

### 3. Two API Endpoints

- `POST /api/chat` — public (unchanged behavior, just points to public KB)
- `POST /api/chat-private` — private (new file, accepts `promptId`)

### 4. Private Chat Route

`/chat/private` is accessible by direct URL only — no nav link. This keeps it low-profile for internal use.

### 5. Separate Search Caches

`knowledgeSearch.ts` maintains separate in-memory caches for public and private chunks. Visiting one chat doesn't load the other's data.

---

## Tasks

### Task 6.7.1 — Modify build script for dual knowledge base output

**File**: `scripts/build-knowledge-base.ts`

**Changes**:

1. Add `PUBLIC_EXCLUDED_CATEGORIES` constant:

   ```typescript
   const PUBLIC_EXCLUDED_CATEGORIES = new Set(['Sales_Pitches', 'FloDesk Emails']);
   ```

2. After processing all documents (existing loop), split into two sets:

   ```typescript
   const allDocuments = [...]; // existing result
   const publicDocuments = allDocuments.filter(
     d => !PUBLIC_EXCLUDED_CATEGORIES.has(d.category)
   );
   const privateDocuments = allDocuments; // all docs
   ```

3. Chunk both sets and write to separate output directories:
   - `public/knowledge-base/public/manifest.json` + `chunks.json`
   - `public/knowledge-base/private/manifest.json` + `chunks.json`

4. Update build summary to show stats for both:

   ```
   PUBLIC:  280 docs, 1050 chunks, 10 categories (excluded: Sales_Pitches, FloDesk Emails)
   PRIVATE: 352 docs, 1279 chunks, 12 categories
   ```

5. Remove old output paths (`public/knowledge-base/manifest.json`, `public/knowledge-base/chunks.json`)

**Verify**: Run `npx tsx scripts/build-knowledge-base.ts` and confirm:

- Two subdirectories created with correct files
- Public chunks.json contains zero entries with category "Sales_Pitches" or "FloDesk Emails"
- Private chunks.json contains entries from all 12 categories
- Core documents present in both knowledge bases

---

### Task 6.7.2 — Add `ChatMode` type to chat models

**File**: `src/models/chat.ts`

**Changes**:

1. Add `ChatMode` type:

   ```typescript
   export type ChatMode = 'public' | 'private';
   ```

2. Add `PrivateChatApiRequest` extending existing request:
   ```typescript
   export interface PrivateChatApiRequest {
     messages: Array<{ role: 'user' | 'assistant'; content: string }>;
     context: ContextChunk[];
     promptId?: string;
   }
   ```

---

### Task 6.7.3 — Update knowledge search to accept mode parameter

**File**: `src/services/chat/knowledgeSearch.ts`

**Changes**:

1. Replace single cache with per-mode caches:

   ```typescript
   const caches: Record<ChatMode, { chunks: KnowledgeChunk[]; index: SearchIndex | null }> = {
     public: { chunks: [], index: null },
     private: { chunks: [], index: null },
   };
   ```

2. Update `loadKnowledgeBase(mode: ChatMode)` to fetch from `/knowledge-base/${mode}/chunks.json`

3. Update `searchKnowledge(query, mode: ChatMode = 'public')` to use the correct cache

4. Update `preloadKnowledgeBase(mode: ChatMode)` signature

**Verify**: Import and call `searchKnowledge('test', 'public')` and `searchKnowledge('test', 'private')` — each should load the correct chunks file.

---

### Task 6.7.4 — Update chatApi to route to correct endpoint

**File**: `src/services/chat/chatApi.ts`

**Changes**:

1. Update `streamChatResponse` signature:

   ```typescript
   export async function* streamChatResponse(
     messages: Array<{ role: string; content: string }>,
     context: ContextChunk[],
     mode: ChatMode = 'public',
     promptId?: string
   ): AsyncGenerator<ChatStreamEvent>
   ```

2. Select endpoint based on mode:

   ```typescript
   const endpoint = mode === 'private' ? '/api/chat-private' : '/api/chat';
   ```

3. Include `promptId` in request body when mode is private:
   ```typescript
   const body: Record<string, unknown> = { messages, context };
   if (mode === 'private' && promptId) {
     body.promptId = promptId;
   }
   ```

---

### Task 6.7.5 — Update useChat hook to accept mode and promptId

**File**: `src/hooks/useChat.ts`

**Changes**:

1. Update function signature:

   ```typescript
   export function useChat(mode: ChatMode = 'public', promptId?: string);
   ```

2. Pass `mode` to `searchKnowledge`:

   ```typescript
   const context = await searchKnowledge(text, mode);
   ```

3. Pass `mode` and `promptId` to `streamChatResponse`:

   ```typescript
   for await (const event of streamChatResponse(apiMessages, context, mode, promptId)) {
   ```

4. Add `mode` and `promptId` to `useCallback` dependency array

---

### Task 6.7.6 — Update ChatPage to pass public mode explicitly

**File**: `src/views/ChatPage.tsx`

**Changes**:

1. Pass `'public'` to useChat:

   ```typescript
   const { messages, isStreaming, error, sendMessage, clearChat } = useChat('public');
   ```

2. No other changes — public chat page has no dropdown, no visual changes

---

### Task 6.7.7 — Create PrivateChatPage

**File**: `src/views/PrivateChatPage.tsx` (NEW)

**Changes**:

1. Create new page component that:
   - Uses `useChat('private', selectedPromptId)`
   - Shows "Internal CMO" badge
   - Has prompt selector dropdown (details in Feature 6.8 tasks)
   - Otherwise reuses same ChatThread, ChatInput, SourcePanel components

2. For now (before 6.8 tasks), just wire it up with `useChat('private')` and no dropdown — the dropdown gets added in Feature 6.8.

---

### Task 6.7.8 — Create private chat API endpoint

**File**: `api/chat-private.ts` (NEW)

**Changes**:

1. Copy structure from `api/chat.ts`
2. Accept `promptId` from request body (will be used by Feature 6.8)
3. For now, use same system prompt as public (will be replaced in Feature 6.8 tasks)
4. Same validation, same streaming, same error handling
5. Extract `buildContextBlock` into a shared function (or duplicate — it's small)

---

### Task 6.7.9 — Add /chat/private route

**File**: `src/App.tsx`

**Changes**:

1. Import `PrivateChatPage`
2. Add route:
   ```tsx
   <Route path="/chat/private" element={<PrivateChatPage />} />
   ```
3. No navigation link added (private chat is accessible by direct URL only)

---

### Task 6.7.10 — Clean up old knowledge base paths

**Files**: Multiple

**Changes**:

1. Delete `public/knowledge-base/manifest.json` and `public/knowledge-base/chunks.json` (old root-level files) after confirming the new subdirectory structure works
2. Verify `.gitignore` still covers `public/knowledge-base/` (already does — subdirectories are covered)
3. Run `npm run build` end-to-end to verify everything works

---

## Verification Plan

After all tasks complete:

1. **Build**: `npm run build` succeeds, produces both knowledge bases
2. **Public chat**: Visit `/chat` — works as before, no visual changes
3. **Private chat**: Visit `/chat/private` — loads with full knowledge base
4. **Data isolation**: Search "sales pitch" on public → no Sales_Pitches content. Search same on private → Sales_Pitches content appears
5. **API**: `POST /api/chat` and `POST /api/chat-private` both stream responses
6. **No regressions**: Existing public chat behavior unchanged

---

## Task Dependency Order

```
6.7.1 Build script (dual output)
  |
  +--► 6.7.2 ChatMode type
  |       |
  |       +--► 6.7.3 Knowledge search (mode param)
  |       |       |
  |       |       +--► 6.7.4 chatApi (endpoint routing)
  |       |               |
  |       |               +--► 6.7.5 useChat (mode + promptId)
  |       |                       |
  |       |                       +--► 6.7.6 ChatPage (public mode)
  |       |                       |
  |       |                       +--► 6.7.7 PrivateChatPage (new)
  |       |
  |       +--► 6.7.8 Private API endpoint
  |
  +--► 6.7.9 Route config
  |
  +--► 6.7.10 Clean up old paths
```

**Parallelizable**: 6.7.8 can be built in parallel with 6.7.3–6.7.7. Route config (6.7.9) can happen anytime after 6.7.7.

---

**Created**: March 20, 2026
**Status**: READY FOR IMPLEMENTATION
