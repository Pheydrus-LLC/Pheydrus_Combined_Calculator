# Technical Requirements: Multi-Prompt System

## Tech Stack

- **Existing**: TypeScript, React, Vercel Serverless, @anthropic-ai/sdk
- **No new dependencies required**

## Architecture

### Prompt Storage

Prompts are stored as string constants in the serverless functions — **not** in a database, config file, or client-side code.

```
api/
├── chat.ts              # Contains PUBLIC_PROMPT (single, hardcoded)
└── chat-private.ts      # Contains PROMPTS map (keyed by promptId)

src/
├── models/
│   └── chat.ts          # PromptOption type + PRIVATE_PROMPT_OPTIONS constant
└── views/
    └── PrivateChatPage.tsx  # Dropdown renders PRIVATE_PROMPT_OPTIONS
```

### Security Model

```
Frontend knows:          Backend knows:
─────────────────       ─────────────────
promptId: "general"  →  Full prompt text
promptId: "email..."  →  Full prompt text

The frontend NEVER sees prompt content.
Only the promptId string crosses the network boundary.
```

## Data Types

### `src/models/chat.ts` — Additions

```typescript
/** Available prompt options for private chat dropdown */
interface PromptOption {
  id: string;
  label: string;
  description: string;
  starterQuestions: string[];
}

/** Prompt options displayed in private chat dropdown */
const PRIVATE_PROMPT_OPTIONS: PromptOption[] = [
  {
    id: 'general',
    label: 'General Knowledge',
    description: 'Full-access assistant for product and course information',
    starterQuestions: [
      'Compare all current program pricing and features',
      'What are the key selling points for 21 DOMA?',
      'Walk me through the product routing decision tree',
      'What objections come up most in sales calls?',
    ],
  },
  {
    id: 'email-generator',
    label: 'Email Generator',
    description: 'Draft emails matching Pheydrus FloDesk tone and style',
    starterQuestions: [
      "Write a launch email for the Artist's Way course",
      'Draft a re-engagement email for inactive subscribers',
      "Create a testimonial spotlight email for Hero's Journey",
      'Write a welcome sequence email for new calculator users',
    ],
  },
];

/** Starter questions for public chat (no prompt selector) */
const PUBLIC_STARTER_QUESTIONS: string[] = [
  'What programs does Pheydrus offer?',
  'How does my life path number affect my career?',
  "What's included in the Hero's Journey program?",
  'How can astrology help with personal growth?',
];
```

## Server-Side Prompt Definitions

### `api/chat.ts` — Public Prompt

The existing `SYSTEM_PROMPT` constant remains unchanged. This is the single prompt used for all public chat interactions.

### `api/chat-private.ts` — Prompt Map

```typescript
const PROMPTS: Record<string, string> = {
  general: `You are the Pheydrus Internal Knowledge Assistant — a comprehensive reference
for the entire Pheydrus product ecosystem. You have access to ALL training materials
including sales pitches, email campaigns, and internal strategy docs.

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
- Be thorough — team members need complete information`,

  'email-generator': `You are the Pheydrus Email Copywriter — an expert at crafting emails
that match the exact tone, voice, and style of Pheydrus FloDesk email campaigns.

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
- Reference which email patterns you are drawing inspiration from`,
};

const DEFAULT_PROMPT_ID = 'general';
```

### Private API Request Handling

```typescript
interface PrivateChatRequest {
  messages: ChatMessage[];
  context: ContextChunk[];
  promptId?: string; // Optional — defaults to 'general'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ... same CORS and method checks as chat.ts

  const { messages, context, promptId } = validateRequest(req.body);

  // Resolve prompt
  const resolvedPromptId = promptId && PROMPTS[promptId] ? promptId : DEFAULT_PROMPT_ID;
  if (promptId && !PROMPTS[promptId]) {
    console.warn(`Unknown promptId "${promptId}", falling back to "${DEFAULT_PROMPT_ID}"`);
  }

  const systemPrompt = PROMPTS[resolvedPromptId] + buildContextBlock(context);

  // ... same Claude streaming logic as chat.ts
}
```

## Frontend Integration

### `src/views/PrivateChatPage.tsx` — Prompt Dropdown

```typescript
import { PRIVATE_PROMPT_OPTIONS } from '../models/chat';

export default function PrivateChatPage() {
  const [selectedPromptId, setSelectedPromptId] = useState('general');
  const selectedOption = PRIVATE_PROMPT_OPTIONS.find(o => o.id === selectedPromptId)!;

  const { messages, isStreaming, error, sendMessage, clearChat } = useChat(
    'private',
    selectedPromptId
  );

  const handlePromptChange = (newPromptId: string) => {
    setSelectedPromptId(newPromptId);
    clearChat(); // Reset conversation when switching modes
  };

  return (
    <div className="chat-page private-chat">
      <div className="chat-header">
        <span className="private-badge">Internal CMO</span>
        <div className="prompt-selector">
          <label htmlFor="prompt-select">Mode:</label>
          <select
            id="prompt-select"
            value={selectedPromptId}
            onChange={(e) => handlePromptChange(e.target.value)}
            disabled={isStreaming}
          >
            {PRIVATE_PROMPT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ChatThread
        messages={messages}
        isStreaming={isStreaming}
        starterQuestions={selectedOption.starterQuestions}
      />
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
```

### ChatThread Starter Questions Update

```typescript
// ChatThread.tsx — accept starterQuestions prop instead of hardcoding
interface ChatThreadProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  starterQuestions: string[]; // NEW: passed in from parent
}
```

### `src/hooks/useChat.ts` — Modified Signature

```typescript
export function useChat(mode: ChatMode = 'public', promptId?: string) {
  const sendMessage = useCallback(
    async (text: string) => {
      // Search with mode
      const context = await searchKnowledge(text, mode);

      // Stream with mode + promptId
      for await (const event of streamChatResponse(apiMessages, context, mode, promptId)) {
        // ... same logic
      }
    },
    [messages, isStreaming, mode, promptId]
  );

  // ... rest unchanged
}
```

## Shared Utility: buildContextBlock

Both `api/chat.ts` and `api/chat-private.ts` use the same context block builder. Extract to avoid duplication:

```typescript
// api/_shared/buildContextBlock.ts (or inline in both files)
function buildContextBlock(context: ContextChunk[]): string {
  if (context.length === 0) return '';

  const grouped = new Map<string, ContextChunk[]>();
  for (const chunk of context) {
    const cat = chunk.category || 'General';
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(chunk);
  }

  let block = '\n\n--- KNOWLEDGE BASE CONTEXT ---\n\n';
  for (const [category, chunks] of grouped) {
    block += `## ${category}\n\n`;
    for (const chunk of chunks) {
      block += `### ${chunk.title}\n${chunk.content}\n\n`;
    }
  }
  block += '--- END CONTEXT ---';
  return block;
}
```

## Styling

### Private Chat Visual Differentiation

```css
/* Private badge */
.private-badge {
  background: #7c3aed; /* Purple — distinct from gold public theme */
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Prompt selector */
.prompt-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.prompt-selector select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}

.prompt-selector select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## Adding New Prompts (Future)

To add a new prompt (e.g., "Social Media Caption Writer"):

**Step 1** — Add prompt text to `api/chat-private.ts`:

```typescript
PROMPTS['social-captions'] = `You are the Pheydrus Social Media Writer...`;
```

**Step 2** — Add option to `src/models/chat.ts`:

```typescript
PRIVATE_PROMPT_OPTIONS.push({
  id: 'social-captions',
  label: 'Social Captions',
  description: 'Write social media posts in Pheydrus voice',
  starterQuestions: ['Write an Instagram caption about...'],
});
```

That's it — no component or API structural changes needed.

## Testing Strategy

### Unit Tests

- Prompt map: all promptIds in PRIVATE_PROMPT_OPTIONS exist in api PROMPTS map
- Fallback: invalid promptId resolves to 'general'
- ChatThread: renders correct starter questions per prompt option

### Integration Tests

- Public endpoint: ignores promptId parameter if sent
- Private endpoint: uses correct prompt for each promptId
- Private endpoint: falls back on unknown promptId
- Prompt switch: conversation clears when dropdown changes

### Manual Testing

- Public chat: verify no dropdown visible
- Private chat: switch between General and Email Generator
- Email Generator: ask to write an email → verify structured output (subject, preview, body, CTA)
- General Knowledge: ask about sales strategy → verify internal content referenced

## Files to Create

1. `api/chat-private.ts` — Private chat serverless function with prompt map

## Files to Modify

1. `src/models/chat.ts` — Add PromptOption type, PRIVATE_PROMPT_OPTIONS, PUBLIC_STARTER_QUESTIONS
2. `src/hooks/useChat.ts` — Accept mode and promptId
3. `src/services/chat/chatApi.ts` — Route to correct endpoint, pass promptId
4. `src/components/chat/ChatThread.tsx` — Accept starterQuestions prop
5. `src/views/ChatPage.tsx` — Pass PUBLIC_STARTER_QUESTIONS
6. `src/views/PrivateChatPage.tsx` — NEW: prompt dropdown + private mode

---

**Important:** Prompt text lives server-side ONLY. The frontend sends a short `promptId` string — never the prompt itself. This keeps prompts secure and allows server-side prompt iteration without frontend deployments.
