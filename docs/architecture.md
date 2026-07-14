# Architecture

Voice Agent Lab is intentionally small and reviewable.

```mermaid
flowchart LR
  A["User utterance or ASR transcript"] --> B["Knowledge-base search"]
  B --> C["Top-K context and retrieval trace"]
  C --> D["Priority keyword intent match"]
  D --> E["Dialogue node lookup"]
  E --> F["Response template or host agent"]
  E --> G["Risk and handoff metadata"]
  G --> H["Improvement queue hint"]
```

## Core Files

- `configs/intents.json`: Intent IDs, labels, priorities, keywords, and default nodes.
- `configs/responses.json`: Synthetic response templates with tone and risk metadata.
- `configs/dialogue_flow.json`: Node goals, terminal behavior, handoff behavior, and global safety guards.
- `src/engine.js`: Deterministic matching and routing engine.
- `src/adapters/knowledge_base_adapter.js`: Provider-neutral customer knowledge-base search contract.
- `src/knowledge_retrieval.js`: Per-turn retrieval, context assembly, and trace output.
- `examples/knowledge_base.json`: Synthetic knowledge items for local retrieval tests.
- `examples/synthetic_turns.jsonl`: Regression fixtures.
- `schemas/improvement_record.schema.json`: Shape for unknown or risky turn review.

## Design Principles

- Deterministic first: the default engine does not call an LLM.
- Synthetic fixtures only: no real calls, recordings, or transcripts.
- Reviewable metadata: responses include risk and handoff fields.
- Human escalation is explicit: high-risk turns should not be hidden inside free-form text.
- Multilingual-ready: the example config includes English and a few Chinese synthetic utterances.

## Extension Points

- Add an ASR adapter that writes text into `simulateTurn`.
- Add a TTS adapter that speaks `response_text`.
- Add a knowledge-base adapter that returns normalized Top-K items per turn.
- Add a host-side response generator that receives route metadata and retrieved context.
- Add a queue writer for `improvement_hint`.
- Add a validator that checks config files against JSON Schema.
- Add a UI for non-technical reviewers to test rule changes.
