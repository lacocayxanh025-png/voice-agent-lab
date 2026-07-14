# Version Roadmap

This roadmap explains what is included now and what should be added later.

## Current: v0.6 Example Hardening And Docs Polish

The current package is a safe public baseline with a static synthetic review console, scripted persona sparring, an improvement workbench, config validation, and synthetic language/scenario packs:

- deterministic text engine
- provider-neutral voice adapter shape
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

This is enough for maintainers to test text routing, inspect completed synthetic runs, run scripted persona pressure tests, validate config changes, convert review findings into candidate rules, and connect their own ASR/TTS or multimodal speech stack locally.

v0.6 improves adoption without changing the privacy boundary:

- more synthetic edge-case examples in English and Chinese
- a copyable ASR/TTS integration order and adapter contract
- clearer README first-run and voice-integration paths
- a release note that separates shipped behavior from future work

## Later: Evaluation Report Export

A later release can export review summaries such as pass rate, handoff rate, unknown-intent rate, risk distribution, and candidate-rule counts from synthetic runs.

## Non-Goals

- no provider keys
- no real call recordings
- no real transcripts
- no business-specific private wording
- no automatic production writeback
