# Config Validation

Voice Agent Lab v0.5 adds a local validation command for maintainers who edit routing config or synthetic packs.

```bash
npm run validate:config
```

The command checks:

- `configs/intents.json` against `schemas/config_intents.schema.json`
- `configs/responses.json` against `schemas/config_responses.schema.json`
- `configs/dialogue_flow.json` against `schemas/config_dialogue_flow.schema.json`
- synthetic pack rows under `examples/packs/**/*.jsonl` against `schemas/synthetic_case.schema.json`

It also checks cross-file references:

- every intent points to an existing flow node
- every flow node has a response template
- the `unknown` intent exists
- synthetic pack rows point to existing intent and node IDs

The validator is intentionally lightweight and dependency-free. It is meant for public-safe configuration checks before opening a pull request, not for production policy enforcement.

## Privacy Boundary

Validation does not make real call data safe to publish. Keep examples synthetic and run:

```bash
npm run privacy:check
```

before committing fixture changes.
