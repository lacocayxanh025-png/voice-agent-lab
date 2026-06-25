# Reviewer Notes

This repository is a sanitized open-source candidate derived from an internal voice-agent experimentation workflow.

The original private workflow included real-world domain experiments, audio tooling, and local provider adapters. Those materials are intentionally not included here.

What remains is the reusable open-source core:

- deterministic intent routing
- response metadata for risk and escalation
- unknown-turn improvement queue design
- synthetic multilingual regression fixtures
- privacy checks for publish safety

The current package is intentionally small. That is a strength for initial review: it is easy to inspect, test, and extend without private data access.
