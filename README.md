# Voice Agent Lab

Voice Agent Lab is a privacy-first toolkit for testing voice-agent conversation logic before connecting to real calls or production contact-center systems.

It helps teams design and review:

- voice-agent practice flows for outbound calling or customer support
- intent routing from short user utterances
- risk metadata and escalation boundaries
- "do not continue" and complaint handling
- synthetic regression tests for conversation rules
- an improvement queue for unknown, risky, or low-quality turns

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

## Quick Start

```bash
npm test
npm run privacy:check
node src/simulator.js --text "I want to cancel my account"
node src/simulator.js --text "Do not call me again"
node src/simulator.js --text "你们能帮我预约明天吗"
npm run queue:export
```

You can also open `public/demo.html` for a local reviewer demo. The page includes optional browser voice input and browser speech output when the current browser supports Web Speech APIs. This is a local convenience layer, not a production ASR/TTS integration.

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
  github-repository-setup.md
  improvement-loop.md
  language-strategy.md
  persona-sparring.md
  issue-drafts.md
  pr-sequence.md
  release-plan.md
  reviewer-notes.md
  version-roadmap.md
  voice-layer.md
examples/
  synthetic_turns.jsonl     Synthetic regression examples
  improvement_queue.jsonl   Synthetic review queue examples
  candidate_rules.json      Example proposed rule changes
  personas.json             Synthetic persona examples
public/
  demo.html                 Small static reviewer demo
schemas/
  improvement_record.schema.json
scripts/
  check_no_sensitive_terms.js
  export_improvement_queue.js
src/
  adapters/voice_adapter.js Provider-neutral voice adapter shape
  engine.js                 Core matching and routing engine
  simulator.js              CLI wrapper
tests/
  engine.test.js
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

The first public version includes `src/adapters/voice_adapter.js`. It defines the shape for ASR and TTS integration without binding the project to a provider.

## Persona Sparring

Persona sparring is the synthetic user/customer side of a test conversation. It can be a scripted simulator or a user-provided LLM API that generates the next user turn from a persona, scenario, and conversation history.

It is different from the review console:

- Persona sparring creates or replays synthetic user turns.
- The review console shows completed sparring runs.
- The improvement workbench turns review findings into candidate rules.

See [docs/persona-sparring.md](docs/persona-sparring.md) for the neutral API shape and privacy rules.

A useful sparring persona should define more than a name. The docs cover goal, role, background, communication style, trust level, patience level, privacy sensitivity, objection profile, interruption behavior, repeat behavior, bounded randomness, memory rules, stop conditions, and forbidden content. See `examples/personas.json` for a synthetic example pack.

## Language Strategy

The first public release is English-first. The engine itself is language-neutral because intents, keywords, responses, and examples live in config files. Future updates should add separate synthetic language packs instead of mixing private local phrasing into the baseline repository.

See [docs/language-strategy.md](docs/language-strategy.md) and [docs/version-roadmap.md](docs/version-roadmap.md).

## Improvement Pools

The public package keeps the same basic review logic as the private workflow, but with synthetic data only:

- Intent pool: `configs/intents.json`
- Response pool: `configs/responses.json`
- Flow pool: `configs/dialogue_flow.json`
- Regression pool: `examples/synthetic_turns.jsonl`
- Improvement queue: `examples/improvement_queue.jsonl`
- Candidate rule pool: `examples/candidate_rules.json`

Run `npm run queue:export` to generate queue records from synthetic examples into `tmp/improvement_queue.generated.jsonl`. The queue is meant for review: unknown, risky, or low-quality turns can become proposed keywords, intents, response rewrites, handoff rules, or regression cases.

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

- Add a config-driven review console for completed synthetic runs.
- Add persona sparring APIs and scripted persona examples.
- Add an improvement workbench that turns review findings into candidate rules.
- Add JSON schema validation without requiring runtime dependencies.
- Add English fixture expansion, then optional multilingual and multi-scenario test packs.

## License

MIT
