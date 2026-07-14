# Knowledge-Base Integration

Voice Agent Lab does not replace or copy a customer's knowledge base. It connects to the customer's existing search service through a small provider-neutral adapter.

## Per-Turn Flow

Each user turn can run through the same sequence:

```text
user text or ASR transcript
  -> knowledgeBase.search(query, options)
  -> Top-K relevant knowledge items
  -> route intent and risk with Voice Agent Lab
  -> assemble agent context
  -> host-side agent generates or selects a response
  -> return response plus retrieval trace
```

This works for phone customer service, outbound sales, web chat, and WeChat-like customer-service channels. Phone audio is handled outside this adapter by ASR/TTS or a multimodal speech provider.

## Adapter Contract

Implement one method around the customer's own backend:

```js
const knowledgeBase = {
  async search(query, { topK = 3, filters = {} } = {}) {
    const response = await customerBackend.search({ query, topK, filters });

    return {
      provider: "customer-knowledge-service",
      items: response.items.map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        score: item.score,
        source: item.source,
        version: item.version,
        language: item.language,
        tags: item.tags
      }))
    };
  }
};
```

The adapter can call a REST endpoint, database service, vector search layer, document service, or an existing customer-service backend. The public package only requires the normalized result shape.

## Run The Synthetic Example

The public repository includes ten synthetic knowledge items:

```js
const fs = require("fs");
const { createStaticKnowledgeBaseAdapter } = require("./src/adapters/knowledge_base_adapter");
const { simulateKnowledgeTurn } = require("./src/knowledge_retrieval");

const data = JSON.parse(fs.readFileSync("examples/knowledge_base.json", "utf8"));
const knowledgeBase = createStaticKnowledgeBaseAdapter(data.items);

const result = await simulateKnowledgeTurn("Why do you need my personal information?", {
  knowledgeBase,
  topK: 3
});

console.log(result.knowledge_item_ids);
console.log(result.knowledge_context);
```

The result records the query, provider, item IDs, normalized items, assembled context, and whether any knowledge was found. If a host application provides `responseGenerator`, it receives the route and the retrieved context so it can generate a provider-specific answer without changing the public engine.

## What The Host Application Owns

The customer backend should own:

- credentials and access control
- tenant or workspace selection
- vector indexes or document storage
- retention and audit logs
- source documents and knowledge versions
- production writeback and approval workflow

Voice Agent Lab owns the review contract:

- which items were retrieved for a turn
- which intent and node were selected
- risk and handoff metadata
- whether the result had no relevant context
- which synthetic regression or improvement candidate should be reviewed

## No-Result Handling

When the adapter returns no items, the result sets `knowledge_has_context` to `false` and leaves `knowledge_context` empty. The host agent should ask one clarification question or hand off according to its policy. The maintainer can add a synthetic regression case or a candidate knowledge entry after review.

## Privacy Boundary

Do not commit customer documents, real transcripts, API keys, raw provider responses, or production retrieval logs. Use the synthetic fixture for public tests and keep real retrieval traces in the customer's private environment.
