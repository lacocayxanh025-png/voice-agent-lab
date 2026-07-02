# Improvement Workbench

The improvement workbench helps maintainers turn synthetic review findings into candidate rule changes.

It sits after the review console and persona sparring runner:

```text
synthetic review or persona sparring
  -> improvement queue
  -> improvement workbench
  -> candidate intent, keyword, response, handoff, or regression change
```

## Run It Locally

From the repository root:

```bash
python -m http.server 8080
```

Then open the server URL shown by your terminal and navigate to:

```text
public/improvement-workbench.html
```

The page reads:

```text
examples/improvement_queue.jsonl
examples/candidate_rules.json
```

## Generate Candidate Rules

Use the CLI when you want a repeatable generated candidate file:

```bash
npm run candidate:generate
```

By default, it writes:

```text
tmp/candidate_rules.generated.json
```

Generated files under `tmp/` are intentionally not committed.

## Candidate Actions

The workbench supports these candidate actions:

- `add_intent`
- `add_keyword`
- `rewrite_response`
- `add_handoff_rule`
- `add_regression_case`
- `reject`

These are review proposals, not production changes. A maintainer should inspect the candidate before editing config files.

## Privacy Boundary

The workbench is public-safe:

- Synthetic queue records only.
- No real call logs.
- No real transcripts.
- No private prompts.
- No provider keys.
- No automatic production writeback.
- No external provider calls.

If a real deployment reveals a useful issue, rewrite it into a synthetic queue record before using it here.
