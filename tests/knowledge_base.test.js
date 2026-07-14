const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { createStaticKnowledgeBaseAdapter, requiredKnowledgeBaseProviderShape } = require("../src/adapters/knowledge_base_adapter");
const { retrieveKnowledgeContext, simulateKnowledgeTurn } = require("../src/knowledge_retrieval");
const { validateKnowledgeBase } = require("../scripts/validate_knowledge_base");

const root = path.join(__dirname, "..");
const knowledgeBase = JSON.parse(fs.readFileSync(path.join(root, "examples", "knowledge_base.json"), "utf8"));

async function testSyntheticKnowledgeBaseValidates() {
  assert.deepStrictEqual(validateKnowledgeBase(), []);
}

async function testStaticAdapterReturnsRelevantItems() {
  const adapter = createStaticKnowledgeBaseAdapter(knowledgeBase.items);
  const response = await adapter.search("Why do you need my personal information", { topK: 2 });

  assert.strictEqual(response.provider, "static-synthetic");
  assert.ok(response.items.length >= 1);
  assert.strictEqual(response.items[0].id, "privacy_minimum_data");
}

async function testPerTurnRetrievalIncludesTrace() {
  const adapter = createStaticKnowledgeBaseAdapter(knowledgeBase.items);
  const result = await simulateKnowledgeTurn("I need a human agent now", {
    knowledgeBase: adapter,
    topK: 3
  });

  assert.strictEqual(result.matched_intent.intent_id, "handoff_request");
  assert.strictEqual(result.response_mode, "rule-engine");
  assert.ok(result.knowledge_item_ids.includes("human_handoff"));
  assert.ok(result.knowledge_context.includes("Human handoff"));
}

async function testExternalGeneratorReceivesKnowledgeContext() {
  const adapter = createStaticKnowledgeBaseAdapter(knowledgeBase.items);
  const result = await simulateKnowledgeTurn("How much is the fee?", {
    knowledgeBase: adapter,
    responseGenerator: async ({ knowledge_items, knowledge_context, route }) => {
      assert.ok(knowledge_items.some((item) => item.id === "pricing_boundary"));
      assert.ok(knowledge_context.includes("Pricing boundary"));
      assert.strictEqual(route.matched_intent.intent_id, "price_or_cost");
      return { response_text: "The pricing details are reviewed with a human representative." };
    }
  });

  assert.strictEqual(result.response_mode, "external-agent");
  assert.strictEqual(result.response_text, "The pricing details are reviewed with a human representative.");
}

async function testMissingContextIsExplicit() {
  const adapter = createStaticKnowledgeBaseAdapter(knowledgeBase.items);
  const retrieval = await retrieveKnowledgeContext({
    query: "zebra orbit policy",
    adapter,
    topK: 3
  });

  assert.strictEqual(retrieval.has_context, false);
  assert.deepStrictEqual(retrieval.item_ids, []);
  assert.strictEqual(retrieval.context_text, "");
}

assert.deepStrictEqual(Object.keys(requiredKnowledgeBaseProviderShape()), ["search"]);
Promise.all([
  testSyntheticKnowledgeBaseValidates(),
  testStaticAdapterReturnsRelevantItems(),
  testPerTurnRetrievalIncludesTrace(),
  testExternalGeneratorReceivesKnowledgeContext(),
  testMissingContextIsExplicit()
]).then(() => {
  console.log("Knowledge-base integration checks passed.");
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
