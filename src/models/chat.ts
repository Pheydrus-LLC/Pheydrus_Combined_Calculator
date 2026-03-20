export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[];
  timestamp: number;
}

export interface Citation {
  documentId: string;
  title: string;
  category: string;
  fileName: string;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  title: string;
  category: string;
  subcategory: string;
  content: string;
  isCore: boolean;
  chunkIndex: number;
  totalChunks: number;
}

export interface KnowledgeManifest {
  generatedAt: string;
  documentCount: number;
  chunkCount: number;
  categories: string[];
  documents: DocumentMeta[];
}

export interface DocumentMeta {
  id: string;
  title: string;
  fileName: string;
  category: string;
  subcategory: string;
  relativePath: string;
  fileType: string;
  wordCount: number;
  chunkCount: number;
  isCore: boolean;
}

export interface ContextChunk {
  id: string;
  title: string;
  content: string;
  category: string;
}

export interface ChatApiRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  context: ContextChunk[];
}

export interface ChatStreamEvent {
  text?: string;
  error?: string;
}

// ── Public / Private chat mode ──────────────────────────────────────────────

export type ChatMode = 'public' | 'private';

export interface PromptOption {
  id: string;
  label: string;
  description: string;
  starterQuestions: string[];
}

export const PUBLIC_STARTER_QUESTIONS: string[] = [
  'What programs does Pheydrus offer?',
  'How does my life path number affect my career?',
  "What's included in the Hero's Journey program?",
  'How can astrology help with personal growth?',
];

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
