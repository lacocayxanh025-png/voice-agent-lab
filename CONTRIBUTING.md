# Contributing

Thanks for considering a contribution.

## Good First Contributions

- Add synthetic utterances to `examples/synthetic_turns.jsonl`.
- Add missing keywords to an existing intent.
- Improve response wording while preserving risk metadata.
- Add tests for a new rule.
- Improve documentation for non-technical reviewers.

## Privacy Rules

Do not submit:

- real recordings
- real transcripts
- phone numbers
- names of private customers
- API keys
- provider tokens
- production logs

Use synthetic examples only.

## Pull Request Checklist

- `npm test` passes.
- `npm run privacy:check` passes.
- New routing behavior has at least one fixture.
- High-risk behavior has explicit handoff or stop-contact metadata.
- Response templates do not promise guaranteed outcomes.
