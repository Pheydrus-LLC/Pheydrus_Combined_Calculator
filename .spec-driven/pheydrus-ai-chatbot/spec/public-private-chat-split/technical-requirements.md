# Technical Requirements: Public & Private Chat Split

## Tech Stack

- **Existing**: TypeScript, React, Vite, Vercel Serverless, @anthropic-ai/sdk, react-markdown
- **No new dependencies required**

## Architecture

### Updated File Structure

```
scripts/
└── build-knowledge-base.ts           # Modified: outputs two knowledge bases

api/
├── chat.ts                           # Modified: uses public KB + hardcoded prompt
└── chat-private.ts                   # NEW: uses private KB + selectable prompts

public/
└── knowledge-base/                   # Modified: split into subdirectories
    ├── public/
    │   ├── manifest.json
    │   └── chunks.json
    └── private/
        ├── manifest.json
        └── chunks.json

src/
├── models/
│   └── chat.ts                       # Modified: add ChatMode, PromptConfig types
├── services/
│   └── chat/
│       ├── knowledgeSearch.ts        # Modified: accept mode parameter
│       └── chatApi.ts                # Modified: route to correct endpoint
├── hooks/
│   └── useChat.ts                    # Modified: accept mode parameter
├── components/
│   └── chat/
│       ├── ChatThread.tsx            # Unchanged
│       ├── ChatMessage.tsx           # Unchanged
│       ├── ChatInput.tsx             # Unchanged
│       └── SourcePanel.tsx           # Unchanged
└── views/
    ├── ChatPage.tsx                  # Modified: public mode, no dropdown
    └── PrivateChatPage.tsx           # NEW: private mode, prompt dropdown
```

## Data Types

### New Types in `src/models/chat.ts`

```typescript
/** Which chat mode is active */
type ChatMode = 'public' | 'private';

/** Prompt configuration for private chat */
interface PromptOption {
  id: string;
  label: string; // Display name in dropdown
  description: string; // Tooltip/subtitle text
}

/** Extended API request for private chat */
interface PrivateChatApiRequest extends ChatApiRequest {
  promptId: string;
}
```

### Prompt Options (hardcoded in frontend for private chat)

```typescript
const PRIVATE_PROMPT_OPTIONS: PromptOption[] = [
  {
    id: 'general',
    label: 'General Knowledge',
    description: 'General Pheydrus product and course assistant',
  },
  {
    id: 'email-generator',
    label: 'Email Generator',
    description: 'Generate emails matching Pheydrus FloDesk tone and style',
  },
];
```

## Build Script Modifications

### `scripts/build-knowledge-base.ts`

#### Category Exclusion Configuration

```typescript
/** Categories excluded from the public knowledge base */
const PUBLIC_EXCLUDED_CATEGORIES = new Set(['Sales_Pitches', 'FloDesk Emails']);
```

#### Dual Output Logic

```typescript
async function main() {
  // 1. Walk and process ALL files from Train_CMO (same as today)
  // 2. Split processed documents into two sets:
  //    - publicDocs: exclude PUBLIC_EXCLUDED_CATEGORIES
  //    - privateDocs: all documents (no exclusions)
  // 3. Chunk both sets independently
  // 4. Write public output to public/knowledge-base/public/
  // 5. Write private output to public/knowledge-base/private/
  // 6. Print summary for both
}
```

#### Build Summary Output

```
Knowledge Base Build Complete
─────────────────────────────
PUBLIC Knowledge Base:
  Documents: 280 | Chunks: 1,050 | Categories: 10
  Excluded: Sales_Pitches (42 docs), FloDesk Emails (30 docs)

PRIVATE Knowledge Base:
  Documents: 352 | Chunks: 1,279 | Categories: 12
  All categories included

Output: public/knowledge-base/public/  (2.6 MB)
        public/knowledge-base/private/ (3.4 MB)
```

## Knowledge Search Modifications

### `src/services/chat/knowledgeSearch.ts`

```typescript
// Separate caches per mode
let publicChunks: KnowledgeChunk[] = [];
let privateChunks: KnowledgeChunk[] = [];
let publicIndex: SearchIndex | null = null;
let privateIndex: SearchIndex | null = null;

async function loadKnowledgeBase(mode: ChatMode): Promise<void> {
  const basePath = `/knowledge-base/${mode}/chunks.json`;
  // Load and index for the requested mode
  // Cache separately so both can coexist
}

export async function searchKnowledge(
  query: string,
  mode: ChatMode = 'public'
): Promise<ContextChunk[]> {
  await loadKnowledgeBase(mode);
  // Use the correct index for the mode
  // Core document logic remains the same
}
```

## Chat API Modifications

### `src/services/chat/chatApi.ts`

```typescript
export async function* streamChatResponse(
  messages: Array<{ role: string; content: string }>,
  context: ContextChunk[],
  mode: ChatMode = 'public',
  promptId?: string
): AsyncGenerator<ChatStreamEvent> {
  const endpoint = mode === 'private' ? '/api/chat-private' : '/api/chat';
  const body: Record<string, unknown> = { messages, context };
  if (mode === 'private' && promptId) {
    body.promptId = promptId;
  }
  // Rest of streaming logic unchanged
}
```

## API Endpoints

### `api/chat.ts` (Public — Modified)

Changes from current implementation:

- System prompt remains hardcoded (same as today's `SYSTEM_PROMPT` constant)
- No `promptId` parameter accepted
- Functionally identical to current behavior

### `api/chat-private.ts` (Private — New)

```typescript
import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/** System prompts keyed by promptId */
const PROMPTS: Record<string, string> = {
  general: `You are the Pheydrus Internal Knowledge Assistant...
    [Full access to all training materials including sales pitches and internal content]
    [Same citation and tone rules as public, but can reference internal materials]
    [Help team members understand products deeply, reference sales strategies]`,

  'email-generator': `You are the Pheydrus Email Writer...
    [Focus on FloDesk email tone, structure, and voice]
    [Reference existing FloDesk emails in context for style matching]
    [Generate email drafts that match Pheydrus brand voice]
    [Include subject lines, preview text, and body copy]
    [Warm, encouraging, conversational — never salesy or pushy]`,
};

const DEFAULT_PROMPT_ID = 'general';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Same validation as api/chat.ts
  // 2. Extract promptId from request body (default: 'general')
  // 3. Look up prompt from PROMPTS map (fallback to 'general')
  // 4. Build system prompt with context (same buildContextBlock function)
  // 5. Stream response via Claude API
}
```

### Prompt Details

#### Public Prompt (in `api/chat.ts`)

The existing `SYSTEM_PROMPT` constant — unchanged. Covers:

- Pheydrus Knowledge Assistant role
- Citation rules
- Conversational tone
- Product recommendation waterfall
- Boundaries (only Pheydrus content)

#### Private: General Knowledge Prompt (id: `general`)

```
You are the Pheydrus Internal Knowledge Assistant — a comprehensive reference
for the entire Pheydrus product ecosystem. You have access to ALL training
materials including sales pitches, email campaigns, and internal strategy docs.

KNOWLEDGE SOURCES:
You have access to the complete Pheydrus training library provided as context.
Use this information to answer questions thoroughly. If information is not in
the provided context, say so.

CITATION RULES:
- Cite sources using [Source: filename] format
- Reference specific documents when discussing strategies or content

CAPABILITIES:
- Explain any product, course, or program in full detail
- Reference sales strategies and pitch approaches
- Discuss email campaign patterns and messaging
- Help prepare for client calls with relevant talking points
- Compare programs and help with product routing decisions

TONE:
- Direct and informative — this is an internal tool
- Include specific details: prices, links, program structures
- Be thorough — team members need complete information
```

#### Private: Email Generator Prompt (id: `email-generator`)

```
You are the Pheydrus Email Copywriter — an expert at crafting emails that match
the exact tone, voice, and style of Pheydrus FloDesk email campaigns.

KNOWLEDGE SOURCES:
You have access to Pheydrus email campaigns and marketing materials. Study the
tone, structure, and voice of the FloDesk emails in the context carefully.

YOUR JOB:
- Generate email drafts that match Pheydrus brand voice
- Study the provided FloDesk email examples for tone and structure
- Maintain warmth, curiosity, and encouragement throughout
- Never be salesy or pushy — inspire and invite

OUTPUT FORMAT:
When asked to write an email, provide:
1. **Subject Line** (2-3 options)
2. **Preview Text** (1-2 options)
3. **Email Body** (full draft)
4. **CTA** (call-to-action suggestion)

TONE GUIDELINES (derived from FloDesk emails):
- Warm and personal — like writing to a friend
- Curious and exploratory — invite discovery
- Empowering — help readers see their potential
- Conversational — use "you" and "your" frequently
- Sprinkle in astrology/numerology references naturally

CITATION RULES:
- When drawing from specific email examples, cite with [Source: filename]
- Reference which email patterns you're drawing inspiration from
```

## Frontend Components

### `src/views/ChatPage.tsx` (Modified)

```typescript
// Passes mode='public' to useChat
// No prompt selector dropdown
// Otherwise unchanged
export default function ChatPage() {
  const { messages, isStreaming, error, sendMessage, clearChat } = useChat('public');
  // ... existing layout, no dropdown
}
```

### `src/views/PrivateChatPage.tsx` (New)

```typescript
export default function PrivateChatPage() {
  const [selectedPrompt, setSelectedPrompt] = useState('general');
  const { messages, isStreaming, error, sendMessage, clearChat } = useChat('private', selectedPrompt);

  // When prompt changes, clear the conversation
  const handlePromptChange = (promptId: string) => {
    setSelectedPrompt(promptId);
    clearChat();
  };

  return (
    <div className="chat-page private-chat">
      {/* Internal badge/label */}
      <div className="private-badge">Internal CMO</div>

      {/* Prompt selector dropdown */}
      <div className="prompt-selector">
        <label>Assistant Mode:</label>
        <select value={selectedPrompt} onChange={(e) => handlePromptChange(e.target.value)}>
          {PRIVATE_PROMPT_OPTIONS.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Same chat layout as public */}
      <ChatThread messages={messages} isStreaming={isStreaming} />
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
      <SourcePanel ... />
    </div>
  );
}
```

### `src/hooks/useChat.ts` (Modified)

```typescript
export function useChat(mode: ChatMode = 'public', promptId?: string) {
  // Pass mode to searchKnowledge
  const context = await searchKnowledge(text, mode);

  // Pass mode and promptId to streamChatResponse
  for await (const event of streamChatResponse(apiMessages, context, mode, promptId)) {
    // ... same streaming logic
  }

  // Rest unchanged
}
```

## Route Configuration

### `src/App.tsx`

```typescript
<Routes>
  {/* Existing routes */}
  <Route path="/chat" element={<ChatPage />} />
  <Route path="/chat/private" element={<PrivateChatPage />} />
</Routes>
```

### Navigation

- "Chat" link in header nav points to `/chat` (public)
- Private chat is accessible via direct URL only (no nav link) — intentionally low-profile for internal use

## Performance Considerations

- Both knowledge bases are lazy-loaded independently — visiting public chat does not load private chunks
- If a user visits both chats in one session, both are cached in memory (acceptable — total ~6MB)
- Build time increases slightly (processes documents once, writes twice) — target < 60s total

## Testing Strategy

### Unit Tests

- Build script: verify public output excludes Sales_Pitches and FloDesk Emails
- Build script: verify private output includes all categories
- Knowledge search: verify mode parameter loads correct chunks.json
- Chat API: verify correct endpoint selection per mode

### Integration Tests

- Public chat: ask about a sales pitch topic → should NOT have sales-specific context
- Private chat: ask about a sales pitch topic → should have full context
- Private chat: switch prompts → conversation clears, new prompt applied
- Both endpoints: SSE streaming works correctly

### Manual Verification

- Build both knowledge bases, compare document counts
- Verify no Sales_Pitches or FloDesk content in public chunks.json
- Test email generator prompt with a "write me an email about..." query

## Files to Create

1. `api/chat-private.ts` — Private chat serverless function
2. `src/views/PrivateChatPage.tsx` — Private chat page component

## Files to Modify

1. `scripts/build-knowledge-base.ts` — Dual knowledge base output
2. `src/services/chat/knowledgeSearch.ts` — Accept mode parameter
3. `src/services/chat/chatApi.ts` — Route to correct endpoint
4. `src/hooks/useChat.ts` — Accept mode and promptId parameters
5. `src/models/chat.ts` — Add ChatMode, PromptOption types
6. `src/views/ChatPage.tsx` — Pass mode='public' explicitly
7. `src/App.tsx` — Add `/chat/private` route

---

**Important:** The system prompts for the private chat are defined server-side in `api/chat-private.ts`. The frontend only sends a `promptId` string — it never sees or controls the actual prompt text. This prevents prompt leakage to the browser.
