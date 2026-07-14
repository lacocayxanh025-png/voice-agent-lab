# Language Strategy

The first public release is English-first.

## Current Baseline

- README and maintainer docs are written in English.
- Default examples are mostly English, with a few synthetic non-English examples to prove the engine can handle multilingual fixtures.
- The core engine is language-neutral: it reads keywords and response text from config files.
- No production translation service is required.

## Why English First

English keeps the initial public repository easier for reviewers to inspect. It also avoids publishing private domain wording or local business phrasing from the original private workflow.

## Language Packs

Language support is kept in separate synthetic fixture packs:

- `examples/packs/en/outbound_training.jsonl`
- `examples/packs/en/customer_support.jsonl`
- `examples/packs/en/edge_cases.jsonl`
- `examples/packs/zh/outbound_training.jsonl`
- `examples/packs/zh/customer_support.jsonl`

Each language pack should include:

- synthetic user utterances
- expected intent
- expected node
- risk label expectations when relevant
- notes for cultural or wording differences

The v0.6 edge-case packs intentionally cover both supported and unsupported turns. The unsupported examples should resolve to `unknown` and `clarify_once`; they are useful regression checks for false confidence.

## Configuration Direction

A future update can add:

```json
{
  "default_language": "en",
  "enabled_languages": ["en"],
  "fallback_language": "en"
}
```

The first implementation keeps this simple. Avoid automatic translation in tests unless the translation provider is mocked.

## Privacy Rules

Do not translate or publish real transcripts. If a real conversation reveals a useful language gap, rewrite it into a synthetic example before adding it to a public language pack.
