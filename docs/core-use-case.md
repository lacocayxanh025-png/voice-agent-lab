# Core Use Case

Voice Agent Lab is built for the stage between a conversation knowledge base and a deployed phone or chat agent.

The central workflow is two-sided simulation:

```text
synthetic customer side  <->  support or sales agent side
              |
              v
      review and improvement loop
```

The agent side contains the knowledge base, intent rules, response templates, escalation policy, handoff behavior, and stop-contact policy. The synthetic customer side contains a persona, scenario, goal, communication style, trust level, patience level, privacy sensitivity, objection profile, interruption behavior, and bounded randomness.

## Concrete Phone Scenario

Consider an outbound service agent that needs to explain a service and identify whether the customer wants a follow-up.

The maintainer creates a small synthetic customer set:

1. A curious customer asks what happens next.
2. A skeptical customer asks who the agent represents and whether the call is legitimate.
3. A privacy-sensitive customer asks why personal information is needed.
4. A price-sensitive customer asks about cost and requests a human representative.
5. A dissatisfied customer asks to stop contact.

Each persona speaks from its own constraints. The agent must answer using the configured knowledge base, respect the risk boundary, and select the right next action. The run can be evaluated for:

- expected intent and conversation node
- answer completeness and response wording
- risk level and escalation recommendation
- handoff behavior
- stop-contact behavior
- unknown or unsupported turns
- whether the knowledge base needs a new entry or clearer wording

The same scenario can be run as text, through a private ASR/TTS wrapper for phone testing, or through a private multimodal speech adapter. The public repository stays provider-neutral and synthetic-only.

## Concrete Chat Scenario

For a chat or WeChat-like support channel, the audio layer is omitted and the text events go directly into the routing engine. The customer persona still creates variation: the customer may ask the same question with different wording, change from interest to privacy concern, request a human, or stop the conversation.

This lets a team use one review model across:

- phone customer service
- outbound phone sales and lead qualification
- web chat support
- WeChat-like customer-service channels

The channel changes the transport layer. The knowledge-base review, persona design, risk handling, and improvement loop remain comparable.

## How Findings Become Knowledge-Base Improvements

After a run, the maintainer reviews the conversation and classifies the gap:

- missing intent or keyword
- incomplete knowledge-base answer
- response rewrite needed
- escalation or handoff rule needed
- stop-contact boundary needs a regression case
- unsupported turn that should remain in the improvement queue

The improvement workbench exports a candidate change for review. A maintainer then updates the knowledge base or routing config, adds a synthetic regression case, and runs the checks again. The system does not write changes into production automatically.

## Why This Is Useful

A conversation agent can sound fluent while still missing the user's intent, making an unsafe promise, failing to hand off, or continuing after a stop request. Two-sided synthetic practice makes those moments visible before they become real customer interactions. The repository provides a small, inspectable workflow that teams can adapt to their own knowledge base and provider stack.

## Public Data Boundary

The examples use synthetic personas and synthetic conversations. Real recordings, transcripts, phone numbers, customer identities, provider keys, and production endpoints stay in the maintainer's private environment.
