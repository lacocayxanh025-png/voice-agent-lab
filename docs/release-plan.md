# Release Plan

## v0.1.0

Goal: publish a small, safe baseline repository.

- Deterministic rule engine.
- Provider-neutral ASR/TTS adapter shape.
- English-first documentation and examples.
- Synthetic examples only.
- Privacy scanner.
- Basic tests.
- Documentation for Codex-assisted maintenance.

## v0.2.0

Goal: make completed synthetic runs easier for non-technical reviewers.

- Static browser reviewer console.
- Synthetic review run examples.
- Run list, case list, detail view, issue tags, risk labels, handoff flags, and improvement hints.
- Review data structure checks.
- Synthetic data only.

## v0.3.0

Goal: add the synthetic user side of the test loop.

- Persona sparring API shape and deterministic scripted runner.
- Scripted persona examples with bounded text pools.
- Persona design dimensions and bounded randomness controls.
- Documentation for connecting a user-provided LLM or scripted simulator.
- Privacy rules for keeping real provider logs and customer material out of the repository.

## v0.4.0

Goal: turn review findings into proposed changes.

- Static improvement workbench.
- Candidate rule generation CLI.
- Candidate intent, keyword, response, handoff, and regression-case outputs.
- Exportable candidate rule pool.

## v0.5.0

Goal: improve maintainability and coverage.

- Config validation command.
- Language strategy and optional language packs.
- More multilingual and multi-scenario fixtures.
- CI checks for fixture quality.
