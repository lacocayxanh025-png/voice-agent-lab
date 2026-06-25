# Improvement Loop

Voice Agent Lab keeps the public workflow split into small reviewable pools.

## Public-Safe Pools

1. Intent pool: `configs/intents.json`

   Defines intent IDs, labels, priorities, keywords, and default routing nodes.

2. Response pool: `configs/responses.json`

   Defines response text, tone, risk level, handoff flags, and stop-contact behavior.

3. Flow pool: `configs/dialogue_flow.json`

   Defines node-level review metadata, including terminal nodes, handoff nodes, and safety notes.

4. Regression pool: `examples/synthetic_turns.jsonl`

   Stores synthetic test utterances and expected routing results.

5. Improvement queue: `examples/improvement_queue.jsonl`

   Stores unknown, risky, or low-quality turns that should be reviewed before becoming rules.

6. Candidate rule pool: `examples/candidate_rules.json`

   Stores proposed changes derived from review. A maintainer can approve, reject, or turn these into a pull request.

## How A Voice Session Feeds The Pools

In a full voice setup, the runtime loop is:

```text
audio
  -> ASR or multimodal speech API
  -> text
  -> simulateTurn(text)
  -> response_text + metadata
  -> TTS or multimodal speech API
  -> spoken reply
```

When `simulateTurn` returns `needs_improvement_queue: true`, keep the record in a private or synthetic improvement queue. Public repositories should only include synthetic examples.

## Export Queue Records

Run:

```bash
npm run queue:export
```

By default this reads `examples/synthetic_turns.jsonl` and writes `tmp/improvement_queue.generated.jsonl`.

You can also pass a custom synthetic file:

```bash
node scripts/export_improvement_queue.js --input examples/synthetic_turns.jsonl --output examples/improvement_queue.generated.jsonl
```

The generated queue is a review surface, not an automatic training dataset. Maintainers should review each record, then decide whether to:

- add a keyword
- add a new intent
- rewrite a response
- add a handoff rule
- add a regression case
- reject the item

## What Should Stay Private

Do not commit real audio, real transcripts, provider request IDs, account names, phone numbers, or customer details. If a real voice test finds a gap, rewrite it into a synthetic example before publishing it.
