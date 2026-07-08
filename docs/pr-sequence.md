# PR Sequence

This is a practical first maintenance sequence after the repository is uploaded.

## Baseline Upload: v0.1

Branch:

```text
main
```

Included:

- Deterministic text engine.
- Provider-neutral voice adapter shape.
- English-first documentation.
- Synthetic examples.
- Improvement queue examples.
- Synthetic persona examples.
- Privacy check.
- Browser demo.
- Documentation for voice adapters and persona sparring.

## PR 1: Build review console

Branch:

```text
ui/review-console
```

Changes:

- Add a static review console for completed synthetic runs.
- Show run list, case list, conversation detail, issue tags, and improvement queue status.
- Keep it config-driven and synthetic.

Why this is a good first PR:

- It makes the project easier to inspect.
- It does not require external services.
- It gives Codex a real UI and data-flow review target.

## PR 2: Add persona sparring API

Branch:

```text
sparring/persona-api
```

Changes:

- Add provider-neutral persona sparring API shape.
- Add scripted persona examples.
- Add persona design fields and bounded randomness controls.
- Document how to connect a user-provided LLM locally.
- Add tests that do not make external calls.

Why this comes after the review console:

- The review console gives users a place to inspect sparring results.
- The API remains useful without binding the project to a vendor.

## PR 3: Build improvement workbench

Branch:

```text
ui/improvement-workbench
```

Changes:

- Add a workbench for improvement queue records.
- Convert review findings into candidate rules.
- Export candidate keyword, intent, response, handoff, or regression-case changes.

Why this comes after sparring:

- Review and sparring create the evidence.
- The workbench turns that evidence into maintainable rule changes.

## PR 4: Add config validation and language packs

Branch:

```text
feature/config-validation-language-packs
```

Changes:

- Add draft JSON schemas for config files.
- Add a validation command.
- Keep English as the default language.
- Add optional synthetic language and scenario-pack structure.
- Add a small fixture pack for one additional language.
- Add multi-scenario fixture checks.
- Document that real transcripts must be rewritten into synthetic examples before publication.

## What Not To Do

- Do not add real call transcripts.
- Do not add provider keys.
- Do not add business-specific claims.
- Do not pretend a feature was removed just to add it back later.
