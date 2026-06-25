# Voice Layer

Voice Agent Lab separates the conversation engine from voice providers.

The project is intended for voice-agent practice and evaluation. A real deployment can connect microphone or call audio to an ASR/TTS stack, or to a multimodal speech API, while keeping the repository itself provider-neutral and privacy-safe.

## Current v0.1 Behavior

The core project is text-first:

```text
user text -> intent routing -> response metadata -> response text
```

The static browser demo adds a lightweight local voice layer:

- `Start Voice Input` uses the browser's Web Speech recognition API when available.
- `Speak Response` uses the browser's built-in speech synthesis API.
- No provider key is required.
- No real recordings or transcripts are included in the repository.
- Browser support varies, so the text workflow remains the reliable default.

This means the project can be tested immediately without accounts or keys, while still leaving a clear path to real voice-agent testing.

## Bring Your Own Voice API

Production ASR/TTS or multimodal speech integrations usually require:

- provider credentials
- data-retention review
- audio upload or streaming
- latency and interruption handling
- logs and privacy policy decisions

Those should not be bundled into the first public repository. The safer open-source shape is to define provider-neutral interfaces first, then let users connect their own provider.

Examples of valid integration choices:

- Browser Web Speech APIs for local demos.
- A hosted ASR API plus a hosted TTS API.
- A multimodal speech model that accepts audio input and returns text or audio.
- A local ASR/TTS stack for fully local testing.
- Any OpenAI-compatible or community provider adapter added later.

## Future Adapter Shape

```text
audio input
  -> ASR adapter or multimodal speech adapter
  -> text turn
  -> routing engine
  -> response text
  -> TTS adapter or multimodal speech adapter
  -> audio output
```

Provider examples can include OpenAI-compatible endpoints, browser-only APIs, local engines, or community adapters. None should be required for the default tests.

The public package includes a minimal provider-neutral adapter shape in `src/adapters/voice_adapter.js`. It intentionally throws `not implemented` for real audio methods until a maintainer connects their own provider.

## What Must Stay Out Of The Repository

- Real call recordings.
- Real transcripts.
- Customer names or phone numbers.
- Provider API keys.
- Production call-center logs.

Use synthetic examples in public fixtures. Keep real evaluation data local or private.
