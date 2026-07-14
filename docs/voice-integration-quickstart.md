# Voice Integration Quickstart

Voice Agent Lab is usable without a voice provider. Start with the text engine, then add audio around the stable text contract.

## 1. Verify The Text Path

From the repository root:

```bash
npm test
npm run validate:config
npm run privacy:check
```

The engine receives text and returns a routing result containing `response_text`, `risk_level`, `should_handoff`, `should_stop_contact`, and `terminal`.

## 2. Add An ASR Adapter

Your adapter should accept audio or a provider-native stream and return a small normalized object:

```js
{
  text: "Please connect me with a representative",
  provider: "your-provider",
  confidence: 0.94
}
```

Keep raw audio, provider request IDs, and provider responses in the host application's private storage.

## 3. Route The Transcript

Pass only the normalized text into the engine:

```js
const result = simulateTurn(transcript.text);
```

Use the control fields before speaking. A high-risk result may require a handoff or a short policy response. A terminal stop-contact result should end the interaction according to the host application's policy.

## 4. Add A TTS Adapter

Send `result.response_text` to your TTS adapter and keep the returned audio in the host application:

```js
const audio = await tts.synthesizeSpeech(result.response_text, {
  language: "en",
  interruptible: true
});
```

The `interruptible` option is a host-side signal. The repository does not implement audio playback or barge-in detection.

## 5. Test Before Real Traffic

Use the synthetic packs under `examples/packs/` to check expected intent and node routing. Add a new synthetic JSONL row whenever a provider integration exposes a stable routing gap. Do not add real recordings or copied transcripts.

## Privacy Checklist

- Keep credentials in environment variables or a secret manager.
- Keep audio and transcripts outside the repository.
- Remove provider request IDs from public fixtures when they can identify a real request.
- Run `npm run privacy:check` before opening a pull request.
- Review retention, logging, consent, and regional processing rules in the host application.
