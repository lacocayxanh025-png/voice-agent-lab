# Version Roadmap

This roadmap explains what is included now and what should be added later.

## Current: v0.7 Knowledge-Base Integration

The current package is a safe public baseline with a static synthetic review console, scripted persona sparring, an improvement workbench, config validation, and synthetic language/scenario packs:

- deterministic text engine
- provider-neutral voice adapter shape
- provider-neutral knowledge-base search adapter
- English-first documentation
- synthetic examples only
- improvement queue examples
- candidate rule examples
- privacy scanner
- basic tests and review data checks
- browser demo
- review console with run list, case list, detail view, issue tags, risk labels, handoff flags, and improvement hints
- persona schema
- scripted persona examples
- deterministic local runner for scripted personas
- bounded randomness controls
- improvement workbench for candidate intent, keyword, response, handoff, and regression-case changes
- candidate rule generation CLI
- config validation command
- config schemas for intents, responses, and dialogue flow
- synthetic case schema
- English and Chinese synthetic pack structure
- multi-scenario fixture rows for outbound training and customer support
- no real audio or transcript data
- synthetic knowledge-base fixture with per-turn retrieval traces

This is enough for maintainers to test text routing, inspect completed synthetic runs, run scripted persona pressure tests, validate config changes, convert review findings into candidate rules, and connect their own ASR/TTS or multimodal speech stack locally.

v0.6 improves adoption without changing the privacy boundary:

- more synthetic edge-case examples in English and Chinese
- a copyable ASR/TTS integration order and adapter contract
- clearer README first-run and voice-integration paths
- a release note that separates shipped behavior from future work

v0.7 adds the knowledge-base connection layer without taking ownership of a customer's data:

- `search(query, options)` provider contract
- static synthetic knowledge-base adapter
- per-turn Top-K retrieval and assembled context
- item IDs, source, version, and provider trace
- optional host-side response generator hook
- explicit no-result behavior for improvement review

## Later: Evaluation Report Export

A later release can export review summaries such as pass rate, handoff rate, unknown-intent rate, risk distribution, and candidate-rule counts from synthetic runs.

## Non-Goals

- no provider keys
- no real call recordings
- no real transcripts
- no business-specific private wording
- no automatic production writeback
