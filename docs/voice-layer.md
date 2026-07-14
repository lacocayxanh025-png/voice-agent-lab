# Voice Layer

Voice Agent Lab separates the conversation engine from voice providers.

The project is intended for voice-agent practice and evaluation. A real deployment can connect microphone or call audio to an ASR/TTS stack, or to a multimodal speech API, while keeping the repository itself provider-neutral and privacy-safe.

## Current Behavior

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

## Recommended Integration Order

Use this order when connecting a real voice stack:

1. Validate the text route with `npm test` and `npm run validate:config`.
2. Make the ASR adapter return normalized text plus provider metadata.
3. Pass only the normalized text to `simulateTurn`.
4. Treat `risk_level`, `should_handoff`, `should_stop_contact`, and `terminal` as control metadata, not as spoken content.
5. Send `response_text` to TTS only after applying the host application's interruption and handoff policy.
6. Keep audio, transcripts, provider responses, and credentials outside this repository.

A minimal host-side bridge can look like this:

```js
const { simulateTurn } = require("../src/engine");

async function runVoiceTurn(audioInput, asr, tts) {
  const transcript = await asr.transcribeAudio(audioInput, { language: "en" });
  const routed = simulateTurn(transcript.text);

  const speech = routed.should_stop_contact || routed.terminal
    ? null
    : await tts.synthesizeSpeech(routed.response_text, {
        language: "en",
        interruptible: true
      });

  return { transcript, routed, speech };
}
```

The example intentionally leaves authentication, retries, streaming, barge-in detection, audio formats, and provider-specific request fields to the host application. Those details differ across providers and should be tested with synthetic audio or a private fixture set.

## Adapter Contract

The ASR result should contain at least `{ text, provider }`. It may also include `confidence` and a provider request ID that is stored outside the public repository. The TTS result should contain `{ provider }` plus an audio URL, base64 payload, or host-native audio object. Never commit those payloads or request IDs when they contain real user data.

## What Must Stay Out Of The Repository

- Real call recordings.
- Real transcripts.
- Customer names or phone numbers.
- Provider API keys.
- Production call-center logs.

Use synthetic examples in public fixtures. Keep real evaluation data local or private.
