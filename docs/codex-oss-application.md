# Codex for Open Source Application Draft

This is a draft narrative for applying to the Codex for Open Source program.

## Project

Voice Agent Lab is a privacy-first open-source toolkit for testing voice-agent intent routing, escalation rules, and improvement queues with synthetic conversations.

The project helps maintainers build safer outbound voice-agent and customer-support voice-agent prototypes before connecting to real calls. It focuses on deterministic routing, explicit human handoff, stop-contact handling, and regression tests for conversation logic.

The public baseline is provider-neutral. Maintainers can connect their own ASR, TTS, or multimodal speech API through adapters while keeping provider keys and real audio outside the repository.

## Repository Scope

The public repository contains:

- a deterministic intent-routing engine
- synthetic multilingual fixtures
- response templates with risk and handoff metadata
- an improvement-record schema for unknown or risky turns
- tests that protect behavior during rule changes
- privacy checks that prevent common leaks such as API keys, phone numbers, real recordings, and production transcript references
- documentation for connecting provider-neutral voice adapters without committing credentials or real samples

The repository intentionally excludes:

- real call recordings
- real transcripts
- phone numbers
- customer names
- API keys
- production integrations

## Why This Matters

Voice agents can fail in subtle ways: they may continue after a user asks not to be contacted, over-answer sensitive questions, collect unnecessary personal information, or skip human escalation.

Voice Agent Lab gives teams a small open framework to test these boundaries with synthetic fixtures before real deployment. Teams can use text-only tests during development, browser voice for lightweight demos, and their own speech APIs for fuller practice sessions.

## How Codex Will Help Maintain the Project

Codex would be used for day-to-day open-source maintenance:

- review pull requests for privacy leaks and unsafe response promises
- generate synthetic regression cases when a new intent is proposed
- update config files while preserving schema and priority rules
- refactor the deterministic engine without changing fixture behavior
- maintain documentation, release notes, and contributor guidance
- triage unknown-turn examples into proposed intents or handoff rules
- help implement optional adapters for ASR/TTS while keeping credentials local-only

## Maintenance Plan

Planned near-term issues:

1. Add JSON Schema validation for config files.
2. Add a browser-based reviewer console.
3. Add more multilingual synthetic fixtures.
4. Add an improvement queue export command.
5. Add provider-neutral adapter interfaces for optional LLM-based sparring, ASR/TTS, and multimodal speech integrations.

## Fit for Codex for Open Source

This project is small enough for Codex to review thoroughly, but useful enough to demonstrate ongoing open-source maintenance workflows:

- structured config edits
- fixture-driven tests
- privacy and safety review
- documentation maintenance
- repeatable PR review

The project is designed to remain public-safe and maintainable without requiring access to any private production data.
