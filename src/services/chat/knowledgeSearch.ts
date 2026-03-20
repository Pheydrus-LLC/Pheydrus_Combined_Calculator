import type { KnowledgeChunk, ContextChunk, ChatMode } from '../../models/chat';

interface SearchIndex {
  add: (id: number, text: string) => void;
  search: (query: string, limit?: number) => number[];
}

function createIndex(): SearchIndex {
  // Simple inverted index fallback — FlexSearch loaded dynamically
  const index = new Map<string, Set<number>>();

  return {
    add(id: number, text: string) {
      const words = text
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 2);
      for (const word of words) {
        if (!index.has(word)) index.set(word, new Set());
        index.get(word)!.add(id);
      }
    },
    search(query: string, limit = 100): number[] {
      const queryWords = query
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 2);
      if (queryWords.length === 0) return [];

      const scores = new Map<number, number>();
      for (const word of queryWords) {
        for (const [indexWord, ids] of index) {
          if (indexWord.includes(word) || word.includes(indexWord)) {
            for (const id of ids) {
              scores.set(id, (scores.get(id) || 0) + (indexWord === word ? 2 : 1));
            }
          }
        }
      }

      return [...scores.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id]) => id);
    },
  };
}

// ── Per-mode caches ─────────────────────────────────────────────────────────

interface KBCache {
  chunks: KnowledgeChunk[];
  index: SearchIndex | null;
  loadPromise: Promise<void> | null;
}

const caches: Record<ChatMode, KBCache> = {
  public: { chunks: [], index: null, loadPromise: null },
  private: { chunks: [], index: null, loadPromise: null },
};

async function loadKnowledgeBase(mode: ChatMode): Promise<void> {
  const cache = caches[mode];
  if (cache.chunks.length > 0) return;
  if (cache.loadPromise) return cache.loadPromise;

  cache.loadPromise = (async () => {
    const response = await fetch(`/knowledge-base/${mode}/chunks.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${mode} knowledge base: ${response.status}`);
    }
    cache.chunks = await response.json();

    cache.index = createIndex();
    for (let i = 0; i < cache.chunks.length; i++) {
      cache.index.add(i, `${cache.chunks[i].title} ${cache.chunks[i].content}`);
    }
  })();

  return cache.loadPromise;
}

// ── Search ──────────────────────────────────────────────────────────────────

const MAX_CONTEXT_CHARS = 200_000; // ~50K tokens

export async function searchKnowledge(
  query: string,
  mode: ChatMode = 'public'
): Promise<ContextChunk[]> {
  await loadKnowledgeBase(mode);

  const cache = caches[mode];

  // Always include core documents
  const coreChunks = cache.chunks.filter((c) => c.isCore).map(toContextChunk);

  // Search for relevant chunks
  const matchedIndices = cache.index!.search(query, 100);
  const searchChunks = matchedIndices
    .map((idx) => cache.chunks[idx])
    .filter((c) => !c.isCore) // Don't duplicate core docs
    .map(toContextChunk);

  // Combine: core first, then search results
  const combined = [...coreChunks, ...searchChunks];

  // Cap at token limit
  let totalChars = 0;
  const capped: ContextChunk[] = [];
  for (const chunk of combined) {
    totalChars += chunk.content.length;
    if (totalChars > MAX_CONTEXT_CHARS) break;
    capped.push(chunk);
  }

  return capped;
}

function toContextChunk(chunk: KnowledgeChunk): ContextChunk {
  return {
    id: chunk.id,
    title: chunk.title,
    content: chunk.content,
    category: chunk.category,
  };
}

export async function preloadKnowledgeBase(mode: ChatMode = 'public'): Promise<void> {
  return loadKnowledgeBase(mode);
}
