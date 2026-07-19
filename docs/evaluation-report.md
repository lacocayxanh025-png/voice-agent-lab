# Evaluation Report Export

The evaluation report turns synthetic review runs into a compact, reviewable summary for customer-service and phone-agent training.

Generate the included example report:

```bash
npm run report:export
```

The default command reads:

- `examples/synthetic_review_runs.json`
- `examples/improvement_queue.jsonl`

and writes `examples/evaluation_report.json`. Use the CLI options to select another synthetic input or output path:

```bash
node scripts/export_evaluation_report.js \
  --review path/to/review-runs.json \
  --queue path/to/improvement-queue.jsonl \
  --output tmp/evaluation-report.json
```

The report includes:

- total runs and cases
- passed and needs-review cases
- pass and review rates
- high-risk cases
- required and recommended handoff signals
- unknown-intent cases
- issue-tag and improvement-problem counts
- candidate review record count
- per-run summaries

The output is evidence for a maintainer or support-training team. It does not approve rule changes, mutate a customer knowledge base, or write to a production service. A maintainer can use the report to decide which candidate rules or knowledge-base updates need review next.
