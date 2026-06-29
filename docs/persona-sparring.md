# Persona Sparring

Persona Sparring is the synthetic "other side" of the conversation.

It is separate from the review console:

- Persona sparring generates or replays user/customer turns.
- The review console reads completed sparring runs and shows what happened.
- The improvement workbench turns issues into candidate rules, replies, or regression cases.

## Why It Exists

A voice agent can look fine with one polite test phrase and still fail when the user interrupts, refuses, repeats a question, asks for a human, or raises a privacy concern.

Persona sparring creates those pressure tests with synthetic personas.

Example personas:

- skeptical user who asks who the agent represents
- privacy-sensitive user who avoids sharing details
- impatient user who interrupts
- price-sensitive user who asks about fees
- refusal user who says not to call again
- confused user who repeats the same question

## Persona Design

A useful sparring persona is more than a name. It needs enough structure to create varied but reviewable conversation turns.

Recommended persona fields:

- `persona_id`: stable ID used in logs and review pages.
- `label`: short human-readable name.
- `role`: the user/customer role being simulated.
- `scenario_goal`: what the persona wants from the conversation.
- `background`: synthetic context the persona can refer to.
- `communication_style`: direct, cautious, impatient, confused, skeptical, talkative, terse, etc.
- `knowledge_level`: how much the persona understands before the call starts.
- `trust_level`: how willing the persona is to believe the agent.
- `patience_level`: how many weak replies the persona tolerates.
- `privacy_sensitivity`: how quickly the persona reacts to personal-data requests.
- `objection_profile`: likely objections, such as identity, price, process, privacy, timing, or human handoff.
- `interruption_behavior`: whether the persona may interrupt while the agent is speaking.
- `repeat_behavior`: whether the persona repeats a question when the answer is vague.
- `randomness_controls`: allowed variation in wording, tone, and next-question choice.
- `memory_rules`: what the persona remembers from earlier turns.
- `stop_conditions`: when the persona ends, asks for a human, or refuses further contact.
- `forbidden_content`: things the persona must not invent or reveal.
- `max_turns`: maximum turns before the run stops.

Randomness should be bounded. A persona can vary phrasing and choose between several pressure paths, but it should not invent real personal data or drift into unrelated topics.

## Randomness Controls

Good sparring randomness comes from controlled choice pools:

- opening style pool: polite, guarded, impatient, skeptical
- objection pool: identity, price, privacy, timing, process, human handoff
- pressure level: low, medium, high
- interruption chance: never, sometimes, often
- follow-up depth: ask once, ask twice, keep challenging vague answers
- exit behavior: continue, ask for callback, ask for human, stop contact

For example, a skeptical persona can randomly choose one of these next moves after a weak answer:

- ask who the agent represents
- ask whether a human can explain
- say the answer sounds vague
- ask what happens next
- refuse to share personal information

This keeps tests varied while still making review results explainable.

## Persona Example

See `examples/personas.json` for a synthetic persona pack. These are examples only, not production customer profiles.

## Scripted Runner

The v0.3 package includes a deterministic scripted runner:

```bash
npm run persona:run -- --persona skeptical_identity_checker --seed demo
```

The runner:

- loads `examples/personas.json`
- chooses bounded text from each persona's scripted turn pools
- sends each synthetic persona turn through `simulateTurn`
- returns review-console-compatible cases
- stops when the script ends, the persona stops, or the engine reaches a terminal response

The seed makes the run repeatable for tests and pull request review.

## API Shape

The public repository should not include a real provider key or a real persona model endpoint. A maintainer can connect any LLM or scripted simulator behind this neutral interface:

```js
async function nextPersonaTurn({
  persona,
  conversation,
  last_agent_reply,
  scenario,
  constraints
}) {
  return {
    text: "Synthetic user turn",
    persona_id: persona.id,
    pressure_type: "privacy_concern",
    should_stop: false
  };
}
```

The main engine can then run:

```text
persona turn
  -> simulateTurn(persona_text)
  -> agent response
  -> persona turn
  -> repeat until done
```

The included `src/persona_sparring.js` implements the same shape without external calls.

## What To Configure

Keep persona settings synthetic and reviewable. A maintainer should be able to explain why each persona exists and which behavior it is testing.

## What Must Stay Out

Do not commit:

- real call transcripts
- real customer profiles
- phone numbers
- provider API keys
- private account IDs
- raw prompt logs from paid provider consoles

If a real test finds a useful behavior gap, rewrite it into a synthetic persona or synthetic regression case before publishing it.

## Release Position

Persona Sparring now sits after the review console baseline:

1. Core engine and provider-neutral voice adapter.
2. Review console for completed synthetic runs.
3. Persona sparring API and sample scripted personas.
4. Improvement workbench that turns review findings into candidate rules.
