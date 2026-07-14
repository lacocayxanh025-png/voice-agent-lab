const path = require("path");
const { simulateTurn } = require("./engine");
const { normalizeKnowledgeItem } = require("./adapters/knowledge_base_adapter");

function normalizeSearchResponse(response) {
  if (Array.isArray(response)) {
    return { provider: "external-knowledge-base", items: response };
  }

  return {
    provider: String(response?.provider || "external-knowledge-base"),
    items: Array.isArray(response?.items) ? response.items : []
  };
}

function buildKnowledgeContext(items) {
  return items
    .map((item, index) => `[${index + 1}] ${item.title}\n${item.content}`)
    .join("\n\n");
}

async function retrieveKnowledgeContext({ query, adapter, topK = 3, filters = {} }) {
  if (!adapter || typeof adapter.search !== "function") {
    throw new Error("A knowledge-base adapter with search(query, options) is required.");
  }

  const response = normalizeSearchResponse(await adapter.search(query, { topK, filters }));
  const items = response.items.slice(0, Math.max(1, Math.min(Number(topK) || 3, 20)))
    .map(normalizeKnowledgeItem);

  return {
    query: String(query || ""),
    provider: response.provider,
    item_ids: items.map((item) => item.id),
    items,
    context_text: buildKnowledgeContext(items),
    has_context: items.length > 0
  };
}

async function simulateKnowledgeTurn(text, options = {}) {
  const configDir = options.configDir || path.join(__dirname, "..", "configs");
  const route = simulateTurn(text, { configDir });
  const retrieval = await retrieveKnowledgeContext({
    query: text,
    adapter: options.knowledgeBase,
    topK: options.topK,
    filters: options.filters
  });

  const agentContext = {
    user_text: String(text || ""),
    route,
    knowledge_items: retrieval.items,
    knowledge_context: retrieval.context_text
  };

  const generated = typeof options.responseGenerator === "function"
    ? await options.responseGenerator(agentContext)
    : null;

  return {
    ...route,
    response_text: generated?.response_text || route.response_text,
    response_mode: generated?.response_text ? "external-agent" : "rule-engine",
    knowledge_query: retrieval.query,
    knowledge_provider: retrieval.provider,
    knowledge_item_ids: retrieval.item_ids,
    knowledge_items: retrieval.items,
    knowledge_context: retrieval.context_text,
    knowledge_has_context: retrieval.has_context
  };
}

module.exports = {
  normalizeSearchResponse,
  buildKnowledgeContext,
  retrieveKnowledgeContext,
  simulateKnowledgeTurn
};
