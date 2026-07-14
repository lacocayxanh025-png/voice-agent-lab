# Voice Agent Lab

[![CI](https://github.com/lacocayxanh025-png/voice-agent-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/lacocayxanh025-png/voice-agent-lab/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/lacocayxanh025-png/voice-agent-lab)](https://github.com/lacocayxanh025-png/voice-agent-lab/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Voice Agent Lab is a privacy-first two-sided conversation lab for phone and chat agents. It simulates both sides of a support or sales conversation: an agent that follows a knowledge base and policies, and a synthetic customer with a goal, background, objections, privacy concerns, patience level, and interruption behavior. Teams can review the exchange, find knowledge-base gaps, and turn those findings into candidate rules and regression cases before connecting real users or production channels.

The current public release is v0.6.0. It keeps the core text-first and provider-neutral while adding clearer adoption paths, extra synthetic edge cases, and a more concrete voice-integration guide.

It helps teams design and review:

- phone customer-service, outbound-sales, and chat-support practice flows
- synthetic customer personas and bounded conversation variation
- intent routing from short user utterances
- risk metadata and escalation boundaries
- "do not continue" and complaint handling
- synthetic regression tests for conversation rules
- an improvement queue for unknown, risky, or low-quality turns
- candidate knowledge-base, response, handoff, and regression changes

The repository intentionally uses synthetic examples only. It does not include real call recordings, transcripts, phone numbers, customer names, or API keys.

## Why This Exists

Many voice-agent prototypes jump straight from ASR output to an LLM response. That makes it hard to test repeatability, compliance boundaries, and handoff behavior.

This project is meant to be the test harness around that voice stack. In a real setup, a maintainer can bring their own ASR, TTS, or multimodal API:

```text
microphone / call audio
  -> ASR or multimodal speech API
  -> Voice Agent Lab routing engine
  -> response text + risk / handoff metadata
  -> TTS or multimodal speech API
  -> spoken reply
```

The repository does not ship provider keys or real call samples. It provides the conversation engine, synthetic fixtures, and demo surfaces that make the voice behavior testable.

This project takes a smaller, inspectable approach:

1. Match an utterance to an intent with priority-weighted keywords.
2. Route the intent to a conversation node.
3. Return a response template with risk and handoff metadata.
4. Put unknown or high-risk turns into an improvement queue.
5. Run regression tests against synthetic examples before shipping rule changes.

The rule engine is deliberately simple so maintainers can review pull requests without needing private data or paid services.

## Core Use Case: Simulate Both Sides, Improve The Knowledge Base

Imagine a phone sales or customer-service agent that must explain a service, answer a cost question, respect privacy, stop when asked, and hand off to a person when needed. Before connecting that agent to a phone line or chat channel, a maintainer can create several synthetic customers:

- a curious customer who wants a simple explanation
- a skeptical customer who asks who the agent represents
- a privacy-sensitive customer who does not want to share personal information
- an impatient customer who asks for a human representative
- a customer who changes their mind and asks to stop contact

Voice Agent Lab runs these synthetic customer personas against the same agent flow. The conversation can be text-only, connected to a private ASR/TTS stack for phone testing, or connected to a multimodal speech API owned by the maintainer. For chat or WeChat-like customer service, the same routing and review loop can receive text events directly.

The improvement loop is:

```text
agent knowledge base + policies
  -> synthetic customer persona and scenario
  -> two-sided conversation
  -> review console: intent, risk, handoff, and unknown turns
  -> improvement workbench: candidate knowledge-base or rule change
  -> synthetic regression case
  -> repeat the conversation before release
```

The output is a reviewable improvement record rather than an automatic production change. A team can see which question was misunderstood, which response needs rewriting, whether a handoff rule is missing, and which new example should stay in regression coverage. See [docs/core-use-case.md](docs/core-use-case.md) for the full scenario and channel mapping.

## Quick Start

The shortest useful path is:

1. Run the tests and config checks.
2. Simulate a few text turns with the local engine.
3. Inspect the synthetic review console.
4. Connect your own ASR/TTS or multimodal speech adapter only after the text behavior is understood.

```bash
npm test
npm run validate:config
npm run privacy:check
node src/simulator.js --text "I want to cancel my account"
node src/simulator.js --text "Do not call me again"
node src/simulator.js --text "你们能帮我预约明天吗"
npm run persona:run -- --persona skeptical_identity_checker --seed demo
npm run candidate:generate
npm run queue:export
python -m http.server 8080
```

For a clean first check, run `npm test` and `npm run privacy:check` before opening any browser page. The commands do not need provider credentials or network access.

You can also open `public/demo.html` for a local reviewer demo. The page includes optional browser voice input and browser speech output when the current browser supports Web Speech APIs. This is a local convenience layer, not a production ASR/TTS integration.

The v0.2 review console is available at `public/review-console.html` when served from the repository root. It loads `examples/synthetic_review_runs.json` and lets maintainers inspect synthetic runs, cases, risk labels, handoff flags, and improvement hints. See [docs/review-console.md](docs/review-console.md).

The v0.4 improvement workbench is available at `public/improvement-workbench.html` when served from the repository root. It loads `examples/improvement_queue.jsonl` and previews candidate rules for intent, keyword, response, handoff, or regression-case changes. See [docs/improvement-workbench.md](docs/improvement-workbench.md).

The v0.5 validation command checks routing configs and synthetic language/scenario packs before a maintainer opens a pull request:

```bash
npm run validate:config
```

See [docs/config-validation.md](docs/config-validation.md).

Example output:

```json
{
  "input_text": "Do not call me again",
  "matched_intent": {
    "intent_id": "stop_contact",
    "label": "User requests no further contact",
    "priority": 120,
    "hits": [
      "do not call"
    ],
    "score": 130
  },
  "next_node": "safe_stop",
  "response_text": "Understood. I will stop this conversation and mark that you do not want further contact.",
  "tone": "polite",
  "risk_level": "high",
  "should_handoff": false,
  "handoff_recommended": false,
  "should_stop_contact": true,
  "terminal": true,
  "needs_improvement_queue": true,
  "improvement_hint": {
    "problem_type": "safety_or_policy_boundary",
    "suggested_action": "review_escalation_rule",
    "note": "High-risk node 'safe_stop' should be reviewed before broad deployment."
  }
}
```

## Project Structure

```text
.github/workflows/
  ci.yml                    Runs tests and privacy checks
.env.example                Optional local environment placeholders
configs/
  intents.json              Intent definitions and keyword priorities
  responses.json            Response templates and risk metadata
  dialogue_flow.json        Node-level routing and safety policy
docs/
  architecture.md
  codex-oss-application.md
  config-validation.md
  core-use-case.md
  github-repository-setup.md
  improvement-loop.md
  improvement-workbench.md
  language-strategy.md
  persona-sparring.md
  review-console.md
  issue-drafts.md
  pr-sequence.md
  release-plan.md
  reviewer-notes.md
  version-roadmap.md
  voice-layer.md
examples/
  packs/                    Synthetic language and scenario packs
  synthetic_turns.jsonl     Synthetic regression examples
  improvement_queue.jsonl   Synthetic review queue examples
  candidate_rules.json      Example proposed rule changes
  personas.json             Synthetic persona examples
  synthetic_review_runs.json Synthetic review-console examples
public/
  demo.html                 Small static reviewer demo
  review-console.html       Static synthetic run review console
  improvement-workbench.html Static synthetic candidate-rule workbench
schemas/
  candidate_rule.schema.json
  config_dialogue_flow.schema.json
  config_intents.schema.json
  config_responses.schema.json
  improvement_record.schema.json
  persona.schema.json
  synthetic_case.schema.json
scripts/
  check_no_sensitive_terms.js
  export_improvement_queue.js
  generate_candidate_rules.js
  validate_config.js
src/
  adapters/voice_adapter.js Provider-neutral voice adapter shape
  engine.js                 Core matching and routing engine
  improvement_workbench.js  Candidate rule generation helpers
  persona_sparring.js       Scripted persona sparring runner
  persona_runner.js         CLI wrapper for persona sparring
  schema_validator.js       Lightweight local schema validator
  simulator.js              CLI wrapper
tests/
  config_validation.test.js
  engine.test.js
  improvement_workbench.test.js
  persona_sparring.test.js
  review_data.test.js
  synthetic_packs.test.js
  voice_adapter.test.js
CONTRIBUTING.md
SECURITY.md
CODE_OF_CONDUCT.md
UPLOAD_CHECKLIST.md
```

## Privacy Position

This repository is designed to be safe to publish:

- No real recordings.
- No real transcripts.
- No phone numbers.
- No customer names.
- No local API credentials.
- No production integrations.
- Synthetic fixtures only.

If you connect a real ASR, TTS, or multimodal speech provider, keep keys in `.env` and keep real audio/transcripts outside the repository. The included browser demo may use built-in browser voice APIs when available, but it does not include provider credentials or upload audio to this repository.

## Connecting ASR And TTS

The default project is text-first so it can be reviewed without accounts or provider keys. To use it in a real voice-agent test, connect your own voice stack around the engine:

```text
audio input
  -> your ASR or multimodal speech API
  -> transcript text
  -> simulateTurn(transcript)
  -> response_text + risk / handoff metadata
  -> your TTS or multimodal speech API
  -> spoken reply
```

The repository does not require a specific AI provider. Users can connect browser speech APIs, local ASR/TTS, hosted ASR/TTS, or a multimodal speech model. Provider keys, real audio, and real transcripts should stay outside the repository.

See [docs/voice-layer.md](docs/voice-layer.md) for the provider-neutral adapter shape.

For a copyable integration checklist, see [docs/voice-integration-quickstart.md](docs/voice-integration-quickstart.md).

The first public version includes `src/adapters/voice_adapter.js`. It defines the shape for ASR and TTS integration without binding the project to a provider.

## Persona Sparring

Persona sparring is the synthetic user/customer side of a test conversation. It can be a scripted simulator or a user-provided LLM API that generates the next user turn from a persona, scenario, and conversation history.

It is different from the review console:

- Persona sparring creates or replays synthetic user turns.
- The review console shows completed sparring runs.
- The improvement workbench turns review findings into candidate rules.

See [docs/persona-sparring.md](docs/persona-sparring.md) for the neutral API shape and privacy rules.

A useful sparring persona should define more than a name. The docs cover goal, role, background, communication style, trust level, patience level, privacy sensitivity, objection profile, interruption behavior, repeat behavior, bounded randomness, memory rules, stop conditions, and forbidden content. See `examples/personas.json` for a synthetic example pack.

The v0.3 scripted sparring runner is available through:

```bash
npm run persona:run -- --persona skeptical_identity_checker --seed demo
```

It produces synthetic review cases by running persona turns through the local routing engine. It does not call an external provider.

## Language Strategy

The public release is English-first. The engine itself is language-neutral because intents, keywords, responses, and examples live in config files. v0.5 adds synthetic language and scenario packs under `examples/packs/`, including English outbound-training, English customer-support, and Chinese outbound-training examples.

See [docs/language-strategy.md](docs/language-strategy.md) and [docs/version-roadmap.md](docs/version-roadmap.md).

The additional v0.6 edge-case packs are useful for checking identity questions, privacy boundaries, handoff requests, scheduling, pricing, and unsupported turns before adding a provider.

## Config Validation

Use the local validator before changing config or fixture packs:

```bash
npm run validate:config
```

The command checks JSON schema shape and cross-file references between intents, dialogue nodes, responses, and synthetic pack expectations. It is dependency-free and intended for public-safe maintainer checks.

## Improvement Pools

The public package keeps the same basic review logic as the private workflow, but with synthetic data only:

- Intent pool: `configs/intents.json`
- Response pool: `configs/responses.json`
- Flow pool: `configs/dialogue_flow.json`
- Regression pool: `examples/synthetic_turns.jsonl`
- Language/scenario packs: `examples/packs/**/*.jsonl`
- Improvement queue: `examples/improvement_queue.jsonl`
- Candidate rule pool: `examples/candidate_rules.json`

Run `npm run queue:export` to generate queue records from synthetic examples into `tmp/improvement_queue.generated.jsonl`. The queue is meant for review: unknown, risky, or low-quality turns can become proposed keywords, intents, response rewrites, handoff rules, or regression cases.

Run `npm run candidate:generate` to turn the synthetic improvement queue into `tmp/candidate_rules.generated.json`. The generated file is a review proposal, not an automatic production writeback.

See [docs/improvement-loop.md](docs/improvement-loop.md) for the full loop.

## Current Limitations

- The v0.1 engine is single-turn and deterministic.
- `dialogue_flow.json` guard fields such as `forbidden_promises`, `max_clarifying_turns`, and `next_expected` are declarative review metadata in v0.1; they are not fully enforced by `src/engine.js` yet.
- The browser demo is intentionally small and hardcoded. Its optional voice input/output uses browser APIs when available. The Node.js CLI remains the source of truth until a config-driven reviewer console is implemented.
- Keyword matching currently uses simple substring checks, which can create false positives for short words. This is tracked as a good follow-up issue.

## Maintainer Workflow With Codex

Codex is useful for this repository because most changes need repeatable review:

- add an intent without breaking priority ordering
- rewrite a response while preserving risk metadata
- generate synthetic regression tests for new utterance patterns
- review pull requests for privacy leaks and forbidden promises
- summarize unknown-turn examples into candidate rules
- maintain documentation and release notes

See [docs/codex-oss-application.md](docs/codex-oss-application.md) for a draft application narrative.

## Roadmap

- Add richer evaluation report exports.
- Add provider-neutral adapter examples for common hosting patterns without publishing credentials.
- Keep API adapter examples provider-neutral and key-free.

## License

MIT
