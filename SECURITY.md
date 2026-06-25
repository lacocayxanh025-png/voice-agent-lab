# Security Policy

## Reporting Issues

Please open a private security advisory or contact the maintainers if you find:

- leaked credentials
- real personal data in fixtures
- unsafe stop-contact behavior
- a rule that bypasses human handoff for high-risk requests

## Data Handling

This repository should contain synthetic data only.

If you extend the project with ASR, TTS, or call-center integrations:

- keep credentials in `.env`
- do not commit recordings
- do not commit transcripts from real users
- do not store phone numbers or direct personal identifiers in fixtures
- run `npm run privacy:check` before opening a pull request
