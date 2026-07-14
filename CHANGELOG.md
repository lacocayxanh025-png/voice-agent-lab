# Changelog

## 0.7.0 - 2026-07-14

- Added a provider-neutral knowledge-base adapter contract.
- Added per-turn Top-K retrieval context with item IDs, source, version, and provider trace.
- Added an optional host-side response generator hook that receives route and knowledge context.
- Added a synthetic ten-item knowledge base, schema, validator, and integration tests.
- Documented how customer-owned knowledge bases connect to phone and chat agent workflows.
- Kept customer knowledge, credentials, and production writeback outside the public package.

## 0.6.0 - 2026-07-14

- Added English edge-case synthetic pack covering supported routes and unknown-turn handling.
- Added Chinese customer-support synthetic pack.
- Added a copyable voice-integration quickstart for ASR, routing, TTS, interruption, handoff, and privacy boundaries.
- Expanded `docs/voice-layer.md` with a host-side bridge example and adapter contract.
- Clarified the README first-run path and the relationship between text validation and provider integration.
- Kept the public package provider-neutral, key-free, and synthetic-only.

## 0.5.0 - 2026-07-08

- Added dependency-free config validation.
- Added English and Chinese synthetic language/scenario pack structure.
- Added cross-file checks for intents, flow nodes, responses, and fixture expectations.
