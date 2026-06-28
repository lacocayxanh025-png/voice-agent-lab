# Review Console

The review console is a static, local page for inspecting completed synthetic voice-agent runs.

It is designed for maintainers who want to review:

- run-level pass and review counts
- case-level utterances and responses
- matched intent and next-node routing
- risk level and handoff flags
- issue tags and improvement hints

## Run It Locally

From the repository root:

```bash
python -m http.server 8080
```

Then open the server URL shown by your terminal and navigate to:

```text
public/review-console.html
```

The page loads:

```text
examples/synthetic_review_runs.json
```

## Privacy Boundary

The review console is intentionally public-safe:

- No real call recordings.
- No real transcripts.
- No phone numbers.
- No customer names.
- No provider keys.
- No authentication.
- No external provider API calls.

The page is read-only. It is a review surface, not a production operations console.

## Data Shape

Each review data file should provide:

- `version`
- `runs[]`
- `run_id`
- `summary`
- `cases[]`
- `case_id`
- `input_text`
- `expected_intent`
- `matched_intent`
- `next_node`
- `risk_level`
- `status`
- `issue_tags`
- `response_text`
- optional `improvement_hint`

See `examples/synthetic_review_runs.json` for the current synthetic example pack.

## Relationship To The Improvement Queue

The review console helps maintainers find cases that should move into the improvement queue.

Typical follow-up actions:

- add or adjust an intent keyword
- add a new synthetic regression case
- rewrite a response template
- review handoff wording
- keep a high-risk case under regression coverage

The current page does not write candidate rules automatically. That belongs to the later improvement workbench.
