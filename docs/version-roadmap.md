# Version Roadmap

This roadmap explains what is included now and what should be added later.

## Current: v0.1 Baseline

The current package is a safe public baseline:

- deterministic text engine
- provider-neutral voice adapter shape
- English-first documentation
- synthetic examples only
- improvement queue examples
- candidate rule examples
- privacy scanner
- basic tests
- browser demo

This is enough for maintainers to test text routing and connect their own ASR/TTS or multimodal speech stack locally.

## Next: v0.2 Review Console

Add a config-driven review console for completed synthetic runs:

- run list
- case list
- conversation detail
- issue tags
- improvement queue link
- no real audio or transcript data

## Then: v0.3 Persona Sparring

Add the synthetic user side of the loop:

- persona schema
- scripted persona examples
- bounded randomness controls
- local-only provider hook for users who want to connect their own LLM
- tests with no external calls

## Then: v0.4 Improvement Workbench

Turn review findings into candidate changes:

- candidate intent
- candidate keyword
- candidate response rewrite
- candidate handoff rule
- candidate regression case

## Later: v0.5 Validation And Language Packs

Improve maintainability and coverage:

- config validation command
- English fixture expansion
- optional language packs
- multi-scenario packs
- CI checks for fixture quality

## Non-Goals

- no provider keys
- no real call recordings
- no real transcripts
- no business-specific private wording
- no automatic production writeback
