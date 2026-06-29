# Version Roadmap

This roadmap explains what is included now and what should be added later.

## Current: v0.3 Persona Sparring

The current package is a safe public baseline with a static synthetic review console and scripted persona sparring:

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
- no real audio or transcript data

This is enough for maintainers to test text routing, inspect completed synthetic runs, run scripted persona pressure tests, and connect their own ASR/TTS or multimodal speech stack locally.

## Next: v0.4 Improvement Workbench

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
