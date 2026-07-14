function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizeKnowledgeItem(item, index = 0) {
  if (!item || typeof item !== "object") {
    throw new Error(`Knowledge item ${index} must be an object.`);
  }

  const id = String(item.id || "").trim();
  const title = String(item.title || "").trim();
  const content = String(item.content || item.text || "").trim();

  if (!id || !title || !content) {
    throw new Error(`Knowledge item ${index} requires id, title, and content.`);
  }

  return {
    id,
    title,
    content,
    score: Number.isFinite(item.score) ? item.score : null,
    source: String(item.source || "external-knowledge-base"),
    version: item.version ? String(item.version) : null,
    language: item.language ? String(item.language) : null,
    tags: Array.isArray(item.tags) ? item.tags.map((tag) => String(tag)) : [],
    metadata: item.metadata && typeof item.metadata === "object" ? item.metadata : {}
  };
}

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "about", "can", "do", "for", "how", "i", "is", "it",
  "me", "much", "my", "now", "of", "on", "or", "please", "tell", "the", "this",
  "to", "what", "with", "who", "you", "your"
]);

function tokenize(value) {
  return (normalizeText(value).match(/[a-z0-9]+|[\u4e00-\u9fff]+/g) || [])
    .filter((token) => !STOP_WORDS.has(token));
}

function matchesFilters(item, filters = {}) {
  for (const [key, expected] of Object.entries(filters || {})) {
    if (key === "tags") {
      const requiredTags = Array.isArray(expected) ? expected : [expected];
      if (!requiredTags.every((tag) => item.tags.includes(String(tag)))) return false;
      continue;
    }

    if (String(item[key] || "") !== String(expected)) return false;
  }

  return true;
}

function scoreStaticItem(query, item) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return 0;

  const searchable = tokenize(`${item.title} ${item.content} ${item.tags.join(" ")}`);
  const uniqueSearchable = new Set(searchable);
  const hits = queryTokens.filter((token) => uniqueSearchable.has(token));
  const fullPhraseBonus = normalizeText(`${item.title} ${item.content}`).includes(normalizeText(query)) ? 0.25 : 0;
  return Math.min(1, hits.length / queryTokens.length + fullPhraseBonus);
}

class KnowledgeBaseAdapter {
  async search(_query, _options = {}) {
    throw new Error("search is not implemented. Connect your own knowledge-base provider.");
  }
}

function createStaticKnowledgeBaseAdapter(records = []) {
  const items = records.map(normalizeKnowledgeItem);

  return {
    provider: "static-synthetic",
    async search(query, options = {}) {
      const topK = Math.max(1, Math.min(Number(options.topK) || 3, 20));
      const matches = items
        .filter((item) => matchesFilters(item, options.filters))
        .map((item) => ({ item, score: scoreStaticItem(query, item) }))
        .filter((entry) => entry.score > 0)
        .sort((left, right) => right.score - left.score || left.item.id.localeCompare(right.item.id))
        .slice(0, topK)
        .map((entry) => ({ ...entry.item, score: Number(entry.score.toFixed(4)) }));

      return {
        provider: "static-synthetic",
        query: String(query || ""),
        items: matches
      };
    }
  };
}

function requiredKnowledgeBaseProviderShape() {
  return {
    search: "async function(query, options) -> { items: [{ id, title, content, score?, source?, version? }], provider }"
  };
}

module.exports = {
  KnowledgeBaseAdapter,
  normalizeKnowledgeItem,
  tokenize,
  matchesFilters,
  createStaticKnowledgeBaseAdapter,
  requiredKnowledgeBaseProviderShape
};
