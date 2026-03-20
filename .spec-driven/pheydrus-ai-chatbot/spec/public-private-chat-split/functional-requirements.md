# Functional Requirements: Public & Private Chat Split

## Overview

Split the existing single chat into two separate chat experiences on different routes: a **Public CMO Chat** (`/chat`) accessible to anyone, and a **Private CMO Chat** (`/chat/private`) for internal team use. Each chat has its own knowledge base, system prompt, and access to different training data categories.

## Scope

### Two Knowledge Bases

The build script produces two separate knowledge base outputs instead of one:

| Knowledge Base | Output Directory                 | Categories Included                                                                                                                                                                | Categories Excluded                   |
| -------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **Public**     | `public/knowledge-base/public/`  | 21DOMA, Artist_s Way, Business Growth + Content Creation, Everwebinars, FYNS, Freebies - Calculators - Webinars, Hero_s Journey, Public_CMO, Skool, Video Testimonials_Transcripts | **Sales_Pitches**, **FloDesk Emails** |
| **Private**    | `public/knowledge-base/private/` | ALL 12 categories (no exclusions)                                                                                                                                                  | None                                  |

### Two Chat Routes

| Route           | Knowledge Base | Prompt                                         | Access        |
| --------------- | -------------- | ---------------------------------------------- | ------------- |
| `/chat`         | Public         | Single hardcoded prompt (hidden from frontend) | Anyone        |
| `/chat/private` | Private        | Selectable from dropdown (multiple prompts)    | Internal team |

### Two API Endpoints

| Endpoint                 | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `POST /api/chat`         | Public chat — uses public knowledge base prompt |
| `POST /api/chat-private` | Private chat — accepts `promptId` parameter     |

## User Stories

### US-1: Public Chat Excludes Sensitive Data

**As a** product owner
**I want** the public-facing chat to exclude sales pitches and internal email content
**So that** visitors only see public-appropriate training content

**Acceptance Criteria:**

- [ ] Public knowledge base excludes all files from `Sales_Pitches/` folder
- [ ] Public knowledge base excludes all files from `FloDesk Emails/` folder
- [ ] Public knowledge base includes all other 10 categories
- [ ] Core documents remain the same for public (master catalog, product routing, life paths, rising signs, sales logic)
- [ ] Build script logs document counts for both public and private knowledge bases separately

### US-2: Private Chat Has Full Access

**As an** internal team member
**I want** the private chat to have access to all training data
**So that** I can reference sales materials, email templates, and all internal content

**Acceptance Criteria:**

- [ ] Private knowledge base includes all 12 Train_CMO categories
- [ ] Private knowledge base chunks are stored separately from public chunks
- [ ] Private chat searches only the private knowledge base
- [ ] No data leaks between public and private knowledge bases at runtime

### US-3: Public Chat Route

**As a** website visitor
**I want** to access the chatbot at `/chat`
**So that** I can ask questions about Pheydrus products and courses

**Acceptance Criteria:**

- [ ] `/chat` route loads the public chat page
- [ ] Public chat uses only the public knowledge base
- [ ] Public chat uses a single, hardcoded system prompt (not visible or selectable on the frontend)
- [ ] Public chat UI does not show any prompt selector dropdown
- [ ] Navigation shows "Chat" linking to `/chat`

### US-4: Private Chat Route

**As an** internal team member
**I want** to access a private version of the chatbot at `/chat/private`
**So that** I can use specialized prompts with full training data access

**Acceptance Criteria:**

- [ ] `/chat/private` route loads the private chat page
- [ ] Private chat uses only the private knowledge base
- [ ] Private chat displays a prompt selector dropdown in the UI
- [ ] Changing the selected prompt clears the current conversation
- [ ] Private chat page has a visual indicator that it is the "internal" version (e.g., label or badge)

### US-5: Build Script Generates Both Knowledge Bases

**As a** developer
**I want** the build script to produce two knowledge bases in a single run
**So that** both chat experiences have up-to-date content

**Acceptance Criteria:**

- [ ] Running `npx tsx scripts/build-knowledge-base.ts` produces both knowledge bases
- [ ] Output structure:
  ```
  public/knowledge-base/
  ├── public/
  │   ├── manifest.json
  │   └── chunks.json
  └── private/
      ├── manifest.json
      └── chunks.json
  ```
- [ ] Build summary shows stats for both knowledge bases (document count, chunk count, excluded categories)
- [ ] Build completes within 60 seconds
- [ ] Existing imports/references to the old single knowledge base are updated

### US-6: Separate API Endpoints

**As a** developer
**I want** separate API endpoints for public and private chat
**So that** each uses the correct system prompt and the private endpoint can accept a prompt selection

**Acceptance Criteria:**

- [ ] `POST /api/chat` serves public chat (no `promptId` parameter needed)
- [ ] `POST /api/chat-private` serves private chat (accepts optional `promptId` parameter)
- [ ] Both endpoints validate input the same way
- [ ] Both endpoints stream responses via SSE
- [ ] The public endpoint always uses the single public prompt
- [ ] The private endpoint selects the prompt based on `promptId` (defaults to general knowledge if omitted)

## Error Handling

| Scenario                                                 | Behavior                                                               |
| -------------------------------------------------------- | ---------------------------------------------------------------------- |
| Public user somehow sends request to `/api/chat-private` | Request processes normally (no auth gate for now — future enhancement) |
| Invalid `promptId` on private endpoint                   | Falls back to default general knowledge prompt                         |
| Knowledge base file missing at runtime                   | Returns error message: "Knowledge base not available"                  |
| Category folder missing from Train_CMO at build time     | Logs warning, continues building with available categories             |

## Migration Notes

- The existing `/chat` route continues to work but now uses the public knowledge base
- The existing `public/knowledge-base/chunks.json` and `manifest.json` at root level should be removed in favor of the `public/` and `private/` subdirectories
- The `knowledgeSearch.ts` service needs to accept a parameter for which knowledge base to load

---

**Created**: March 20, 2026
**Status**: SPECIFICATION COMPLETE — READY FOR DEVELOPMENT
