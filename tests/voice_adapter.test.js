const assert = require("assert");
const {
  VoiceAdapter,
  createTextOnlyAdapter,
  requiredVoiceProviderShape
} = require("../src/adapters/voice_adapter");

(async () => {
  const adapter = createTextOnlyAdapter();
  const transcript = await adapter.transcribeText("hello");
  assert.strictEqual(transcript.text, "hello");
  assert.strictEqual(transcript.provider, "text-only");

  const speech = await adapter.synthesizeSpeech("reply");
  assert.strictEqual(speech.audio, null);
  assert.strictEqual(speech.provider, "text-only");

  const shape = requiredVoiceProviderShape();
  assert.ok(shape.transcribeAudio.includes("text"));
  assert.ok(shape.synthesizeSpeech.includes("audio"));

  const base = new VoiceAdapter();
  await assert.rejects(() => base.transcribeAudio(Buffer.from("x")), /not implemented/);
  await assert.rejects(() => base.synthesizeSpeech("x"), /not implemented/);

  console.log("Voice adapter checks passed.");
})();
