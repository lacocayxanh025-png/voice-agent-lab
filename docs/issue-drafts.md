# Issue Drafts

These are ready-to-copy GitHub issues for the first maintenance pass.

## 1. Build a config-driven review console

**Title**

```text
Build a config-driven review console
```

**Body**

```markdown
The project needs a reviewer-facing page for completed synthetic runs. This should help maintainers inspect conversation turns, matched intents, risk labels, handoff flags, and improvement hints without reading raw JSON first.

Scope:
- Add a static/local review console.
- Load synthetic run records or generated improvement queue records.
- Show run list, case list, conversation detail, issue tags, and review status.
- Keep all examples synthetic.

Non-goals:
- No real transcripts.
- No real audio upload.
- No provider API calls.
- No authentication.
```

## 2. Add persona sparring API and scripted personas

**Title**

```text
Add persona sparring API and scripted personas
```

**Body**

```markdown
Persona sparring is the synthetic user/customer side of the test loop. It should generate or replay user turns so the main engine can be tested against skeptical, privacy-sensitive, impatient, refusal, and confused personas.

Scope:
- Define a provider-neutral persona sparring API.
- Define persona fields for role, goal, background, communication style, trust level, patience level, privacy sensitivity, objection profile, interruption behavior, repeat behavior, bounded randomness, memory rules, stop conditions, and forbidden content.
- Add a small scripted persona runner for tests.
- Add synthetic persona definitions.
- Document how a maintainer can connect their own LLM API locally.

Non-goals:
- Do not include provider keys.
- Do not include private prompt logs.
- Do not include real customer profiles.
- Do not require external calls in CI.
```

## 3. Build an improvement workbench

**Title**

```text
Build an improvement workbench
```

**Body**

```markdown
The improvement queue should become a practical workbench for turning review findings into candidate rules.

Scope:
- Read records from `examples/improvement_queue.jsonl` or generated queue files.
- Let maintainers classify an item as keyword, intent, response rewrite, handoff rule, or regression case.
- Produce candidate entries compatible with `examples/candidate_rules.json`.
- Keep the UI local/static and synthetic.

Non-goals:
- No automatic production writeback.
- No real call logs.
- No provider-specific model dependency.
```

## 4. Add JSON Schema validation for config files

**Title**

```text
Add JSON Schema validation for config files
```

**Body**

```markdown
The current config files are plain JSON and are covered by runtime tests, but there is no dedicated schema validation command yet.

Scope:
- Add schemas for `configs/intents.json`, `configs/responses.json`, and `configs/dialogue_flow.json`.
- Add a `npm run validate:config` command.
- Add tests for invalid config examples.

Non-goals:
- Do not introduce production ASR/TTS dependencies.
- Do not require real conversation data.
```

## 5. Add multilingual and multi-scenario synthetic packs

**Title**

```text
Add multilingual and multi-scenario synthetic packs
```

**Body**

```markdown
The current fixture set includes a few English and Chinese synthetic utterances. We should expand it so maintainers can test routing behavior across more natural phrasings and scenarios.

Scope:
- Keep the default public baseline English-first.
- Add 20-30 synthetic utterances.
- Cover stop-contact, privacy, identity, human handoff, scheduling, pricing, interruptions, and repeated questions.
- Add language-pack structure for future non-English fixtures.
- Keep all examples synthetic.
- Update tests if expected routing changes.

Privacy rule:
- No real transcripts, names, phone numbers, recordings, or production logs.
```
