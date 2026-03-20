# Functional Requirements: Multi-Prompt System

## Overview

Implement a prompt management system that allows different system prompts to shape the chatbot's behavior. The **Public CMO** has a single, fixed prompt hidden from the frontend. The **Private CMO** has multiple selectable prompts accessible via a dropdown on the frontend.

## Scope

### Prompt Inventory

| Prompt ID         | Chat Mode | Label             | Purpose                                                  |
| ----------------- | --------- | ----------------- | -------------------------------------------------------- |
| `public-default`  | Public    | _(not shown)_     | General Pheydrus knowledge assistant for visitors        |
| `general`         | Private   | General Knowledge | Full-access internal assistant for product understanding |
| `email-generator` | Private   | Email Generator   | Generate emails matching FloDesk tone and style          |

### Prompt Location

All prompts are defined **server-side only** in the Vercel serverless functions. The frontend never receives or displays prompt text — it only sends a `promptId` string to select which prompt to use.

## User Stories

### US-1: Public Chat Uses Fixed Prompt

**As a** website visitor
**I want** the public chat to always use the same consistent prompt
**So that** I get a predictable, on-brand experience

**Acceptance Criteria:**

- [ ] Public chat always uses the same system prompt (current `SYSTEM_PROMPT` in `api/chat.ts`)
- [ ] No prompt selector is visible on the public chat page
- [ ] The prompt is never sent to or visible from the frontend
- [ ] The public prompt focuses on: product knowledge, course info, astrology/numerology basics
- [ ] The public prompt enforces: citation rules, tone guidelines, topic boundaries

### US-2: Private Chat Prompt Selector

**As an** internal team member
**I want** to choose between different assistant modes via a dropdown
**So that** I can switch between general knowledge queries and email generation

**Acceptance Criteria:**

- [ ] A dropdown appears at the top of the private chat page
- [ ] Dropdown shows prompt label and optionally a short description
- [ ] Default selection is "General Knowledge"
- [ ] Changing the selection clears the current conversation and starts fresh
- [ ] The selected prompt ID is sent with each API request
- [ ] The dropdown is disabled while a response is streaming

### US-3: General Knowledge Prompt (Private)

**As an** internal team member
**I want** a general-purpose assistant with full training data access
**So that** I can look up any product detail, sales strategy, or internal content

**Acceptance Criteria:**

- [ ] Prompt instructs Claude to use ALL provided context (including sales, emails)
- [ ] Prompt allows referencing sales strategies and internal materials
- [ ] Prompt maintains citation rules (`[Source: filename]` format)
- [ ] Tone is direct and informative (internal tool, not customer-facing)
- [ ] Prompt includes product details: prices, links, program structures

### US-4: Email Generator Prompt (Private)

**As an** internal team member
**I want** an email writing assistant that matches Pheydrus FloDesk email style
**So that** I can quickly draft on-brand email campaigns

**Acceptance Criteria:**

- [ ] Prompt instructs Claude to study FloDesk email examples in the context
- [ ] Prompt specifies output format: subject line options, preview text, body, CTA
- [ ] Tone matches Pheydrus emails: warm, personal, empowering, conversational
- [ ] Claude cites which email examples it drew inspiration from
- [ ] Responses include multiple subject line options (2-3)
- [ ] Email drafts naturally incorporate astrology/numerology references when relevant

### US-5: Prompt Fallback Behavior

**As a** developer
**I want** the API to handle invalid or missing prompt IDs gracefully
**So that** the chat never breaks due to prompt configuration issues

**Acceptance Criteria:**

- [ ] If `promptId` is omitted from private chat request, use "general" prompt
- [ ] If `promptId` is an unrecognized value, fall back to "general" prompt
- [ ] A console warning is logged when falling back from an invalid promptId
- [ ] The public endpoint ignores any `promptId` if accidentally included

### US-6: Future Prompt Extensibility

**As a** developer
**I want** the prompt system to be easy to extend with new prompts
**So that** adding a new assistant mode requires minimal code changes

**Acceptance Criteria:**

- [ ] Adding a new prompt requires only:
  1. Add prompt text to the `PROMPTS` map in `api/chat-private.ts`
  2. Add a `PromptOption` entry to the frontend constant array
- [ ] No structural changes needed to API, hooks, or components
- [ ] Prompt options list is a simple constant (not fetched from an API)

## Prompt Design Guidelines

### All Prompts Must Include

1. **Role definition** — Who the assistant is
2. **Knowledge source instructions** — Use ONLY provided context
3. **Citation rules** — `[Source: filename]` format
4. **Tone guidelines** — How to communicate
5. **Boundaries** — What NOT to do (no fabrication, no off-topic)

### Public vs Private Tone Differences

| Aspect                  | Public                               | Private                          |
| ----------------------- | ------------------------------------ | -------------------------------- |
| Audience                | Visitors, prospective students       | Internal team, coaches           |
| Tone                    | Warm, encouraging, conversational    | Direct, thorough, informative    |
| Detail level            | 2-4 paragraphs, high-level           | Comprehensive, include specifics |
| Sales content           | Never reference sales strategies     | Can discuss sales approaches     |
| Email content           | No access                            | Full access to FloDesk patterns  |
| Product recommendations | Waterfall rule (smallest step first) | Full comparison, all options     |

## Starter Questions

Each prompt mode should have its own set of starter questions displayed when the chat is empty:

### Public Chat Starters

- "What programs does Pheydrus offer?"
- "How does my life path number affect my career?"
- "What's included in the Hero's Journey program?"
- "How can astrology help with personal growth?"

### Private General Knowledge Starters

- "Compare all current program pricing and features"
- "What are the key selling points for 21 DOMA?"
- "Walk me through the product routing decision tree"
- "What objections come up most in sales calls?"

### Private Email Generator Starters

- "Write a launch email for the Artist's Way course"
- "Draft a re-engagement email for inactive subscribers"
- "Create a testimonial spotlight email for Hero's Journey"
- "Write a welcome sequence email for new calculator users"

---

**Created**: March 20, 2026
**Status**: SPECIFICATION COMPLETE — READY FOR DEVELOPMENT
