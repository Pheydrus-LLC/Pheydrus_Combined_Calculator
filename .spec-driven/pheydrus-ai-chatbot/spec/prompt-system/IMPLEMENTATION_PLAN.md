# Implementation Plan: Feature 6.8 — Multi-Prompt System

## Context

Building on top of Feature 6.7 (Public & Private Chat Split), this feature adds the prompt management layer. The public chat gets a single fixed prompt (already exists). The private chat gets multiple selectable prompts via a frontend dropdown — starting with "General Knowledge" and "Email Generator".

**Depends on**: Feature 6.7 (public/private split infrastructure must be in place)

---

## Critical Design Decisions

### 1. Prompts Live Server-Side Only

All prompt text is defined in `api/chat-private.ts` as a `Record<string, string>` map. The frontend only knows prompt IDs and display labels — never the actual prompt content. This prevents prompt leakage and allows prompt iteration without frontend redeployment.

### 2. Prompt Options Constant in Frontend

The dropdown options (id, label, description, starter questions) are a hardcoded constant in `src/models/chat.ts`. Adding a new prompt requires one entry in the API file + one entry in the frontend constant. No API call to fetch prompt options.

### 3. Conversation Clears on Prompt Switch

When the user changes the dropdown selection, the conversation resets. This prevents confusion from mixed-prompt conversations and ensures the new prompt's context is clean.

### 4. Starter Questions Per Prompt

Each prompt mode has its own starter questions displayed when the chat is empty. Public chat also gets its own set (replacing the current hardcoded array in ChatThread).

### 5. Fallback Behavior

If the API receives an unknown `promptId`, it falls back to `'general'` with a console warning. The chat never breaks due to prompt misconfiguration.

---

## Tasks

### Task 6.8.1 — Add prompt types and constants to chat models

**File**: `src/models/chat.ts`

**Changes**:

1. Add `PromptOption` interface:

   ```typescript
   export interface PromptOption {
     id: string;
     label: string;
     description: string;
     starterQuestions: string[];
   }
   ```

2. Add `PRIVATE_PROMPT_OPTIONS` constant:

   ```typescript
   export const PRIVATE_PROMPT_OPTIONS: PromptOption[] = [
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
   ```

3. Add `PUBLIC_STARTER_QUESTIONS` constant:
   ```typescript
   export const PUBLIC_STARTER_QUESTIONS: string[] = [
     'What programs does Pheydrus offer?',
     'How does my life path number affect my career?',
     "What's included in the Hero's Journey program?",
     'How can astrology help with personal growth?',
   ];
   ```

---

### Task 6.8.2 — Define prompt texts in private API endpoint

**File**: `api/chat-private.ts`

**Changes**:

1. Replace the placeholder/copied system prompt with the `PROMPTS` map:

   ```typescript
   const PROMPTS: Record<string, string> = {
     general: `You are the Pheydrus Internal Knowledge Assistant — a comprehensive reference
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

2. Add prompt resolution logic in the handler:

   ```typescript
   const { messages, context, promptId } = validateRequest(req.body);

   const resolvedPromptId = promptId && PROMPTS[promptId] ? promptId : DEFAULT_PROMPT_ID;
   if (promptId && !PROMPTS[promptId]) {
     console.warn(`Unknown promptId "${promptId}", falling back to "${DEFAULT_PROMPT_ID}"`);
   }

   const systemPrompt = PROMPTS[resolvedPromptId] + buildContextBlock(context);
   ```

---

### Task 6.8.3 — Update ChatThread to accept starter questions as prop

**File**: `src/components/chat/ChatThread.tsx`

**Changes**:

1. Add `starterQuestions` to props interface:

   ```typescript
   interface ChatThreadProps {
     messages: ChatMessage[];
     isStreaming: boolean;
     starterQuestions: string[];
     onStarterClick?: (question: string) => void;
   }
   ```

2. Replace hardcoded starter questions array with the prop

3. Keep all other behavior (empty state display, auto-scroll, typing indicator) unchanged

---

### Task 6.8.4 — Update ChatPage to pass public starter questions

**File**: `src/views/ChatPage.tsx`

**Changes**:

1. Import `PUBLIC_STARTER_QUESTIONS` from models
2. Pass to ChatThread:
   ```tsx
   <ChatThread
     messages={messages}
     isStreaming={isStreaming}
     starterQuestions={PUBLIC_STARTER_QUESTIONS}
   />
   ```

---

### Task 6.8.5 — Build prompt dropdown into PrivateChatPage

**File**: `src/views/PrivateChatPage.tsx`

**Changes**:

1. Import `PRIVATE_PROMPT_OPTIONS` from models

2. Add `selectedPromptId` state (default: `'general'`):

   ```typescript
   const [selectedPromptId, setSelectedPromptId] = useState('general');
   ```

3. Look up selected option for starter questions:

   ```typescript
   const selectedOption = PRIVATE_PROMPT_OPTIONS.find((o) => o.id === selectedPromptId)!;
   ```

4. Pass `selectedPromptId` to useChat:

   ```typescript
   const { messages, isStreaming, error, sendMessage, clearChat } = useChat(
     'private',
     selectedPromptId
   );
   ```

5. Handle prompt change (clear conversation):

   ```typescript
   const handlePromptChange = (newPromptId: string) => {
     setSelectedPromptId(newPromptId);
     clearChat();
   };
   ```

6. Render dropdown in header area:

   ```tsx
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
   ```

7. Pass selected option's starter questions to ChatThread:
   ```tsx
   <ChatThread
     messages={messages}
     isStreaming={isStreaming}
     starterQuestions={selectedOption.starterQuestions}
   />
   ```

---

### Task 6.8.6 — Add private chat styling

**File**: `src/App.css` (or relevant stylesheet)

**Changes**:

1. Add styles for the private badge:

   ```css
   .private-badge {
     background: #7c3aed;
     color: white;
     padding: 4px 12px;
     border-radius: 12px;
     font-size: 0.75rem;
     font-weight: 600;
     text-transform: uppercase;
     letter-spacing: 0.05em;
   }
   ```

2. Add styles for the prompt selector:

   ```css
   .prompt-selector {
     display: flex;
     align-items: center;
     gap: 8px;
   }

   .prompt-selector label {
     font-size: 0.875rem;
     font-weight: 500;
     color: #6b7280;
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

3. Style the private chat header to hold badge + dropdown:
   ```css
   .private-chat .chat-header {
     display: flex;
     align-items: center;
     gap: 16px;
     padding: 12px 16px;
     border-bottom: 1px solid #e5e7eb;
   }
   ```

---

### Task 6.8.7 — Ensure public API ignores promptId

**File**: `api/chat.ts`

**Changes**:

1. If a `promptId` field is present in the request body, silently ignore it (don't error)
2. The public endpoint always uses its hardcoded `SYSTEM_PROMPT` regardless of any extra fields
3. This is likely already the case (validation doesn't check for extra fields), but verify explicitly

---

## Verification Plan

After all tasks complete:

1. **Public chat**: Visit `/chat`
   - No dropdown visible
   - Starter questions show public set (Pheydrus programs, life path, Hero's Journey, astrology)
   - Responses use the public prompt tone (warm, conversational)

2. **Private chat — General Knowledge**: Visit `/chat/private`
   - Dropdown visible, defaults to "General Knowledge"
   - Starter questions show internal set (pricing comparison, selling points, decision tree, objections)
   - Ask about sales strategy → gets answer with sales content citations
   - Tone is direct and informative

3. **Private chat — Email Generator**: Switch dropdown to "Email Generator"
   - Conversation clears immediately
   - Starter questions change to email-related prompts
   - Ask "Write a launch email for 21 DOMA" → response includes Subject Line, Preview Text, Body, CTA
   - Response cites FloDesk email sources

4. **Prompt switch**: Switch between General and Email Generator multiple times
   - Each switch clears conversation
   - Correct starter questions displayed each time
   - Dropdown disabled while streaming

5. **Fallback**: Send request to `/api/chat-private` with `promptId: "nonexistent"`
   - Server logs warning
   - Falls back to general prompt
   - Chat works normally

6. **No public regression**: Public chat works identically to before

---

## Task Dependency Order

```
6.8.1 Prompt types + constants (models)
  |
  +--► 6.8.2 Prompt texts in API
  |
  +--► 6.8.3 ChatThread starter questions prop
  |       |
  |       +--► 6.8.4 ChatPage (public starters)
  |       |
  |       +--► 6.8.5 PrivateChatPage (dropdown + private starters)
  |               |
  |               +--► 6.8.6 Private chat styling
  |
  +--► 6.8.7 Public API ignores promptId (verify)
```

**Parallelizable**: 6.8.2 and 6.8.3 can run in parallel after 6.8.1. 6.8.7 is independent of everything.

---

## Adding a New Prompt in the Future

When you want to add a new prompt (e.g., "Social Media Caption Writer"):

**Step 1** — `api/chat-private.ts`: Add entry to `PROMPTS` map

```typescript
PROMPTS['social-captions'] = `You are the Pheydrus Social Media Writer...`;
```

**Step 2** — `src/models/chat.ts`: Add entry to `PRIVATE_PROMPT_OPTIONS`

```typescript
{
  id: 'social-captions',
  label: 'Social Captions',
  description: 'Write social media posts in Pheydrus voice',
  starterQuestions: [
    'Write an Instagram caption about discovering your life path number',
    'Draft 5 Twitter posts promoting the Hero\'s Journey program',
  ],
}
```

No other files need to change. The dropdown picks it up automatically.

---

**Created**: March 20, 2026
**Status**: READY FOR IMPLEMENTATION
