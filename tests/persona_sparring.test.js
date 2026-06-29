const assert = require("assert");
const path = require("path");
const {
  createSeededRandom,
  loadPersonas,
  nextPersonaTurn,
  runPersonaSparring
} = require("../src/persona_sparring");

const root = path.join(__dirname, "..");
const personas = loadPersonas(path.join(root, "examples", "personas.json"));

function testPersonasHaveScripts() {
  assert.ok(personas.length >= 4, "expected at least four synthetic personas");
  for (const persona of personas) {
    assert.ok(persona.persona_id, "persona_id is required");
    assert.ok(Array.isArray(persona.scripted_turns), `${persona.persona_id} needs scripted turns`);
    assert.ok(persona.scripted_turns.length > 0, `${persona.persona_id} needs at least one turn`);
    assert.ok(Array.isArray(persona.forbidden_content), `${persona.persona_id} needs forbidden content`);
  }
}

function testSeededChoiceIsRepeatable() {
  const first = createSeededRandom("same-seed")();
  const second = createSeededRandom("same-seed")();
  assert.strictEqual(first, second);
}

function testNextPersonaTurnUsesScript() {
  const persona = personas.find((item) => item.persona_id === "skeptical_identity_checker");
  const turn = nextPersonaTurn({
    persona,
    turnIndex: 0,
    random: createSeededRandom("script-test")
  });
  assert.strictEqual(turn.persona_id, "skeptical_identity_checker");
  assert.strictEqual(turn.expected_intent, "identity_check");
  assert.ok(turn.text.length > 0);
}

function testSparringRunProducesReviewCases() {
  const persona = personas.find((item) => item.persona_id === "privacy_sensitive_user");
  const run = runPersonaSparring({ persona, seed: "privacy-test" });
  assert.strictEqual(run.persona, persona.label);
  assert.ok(run.cases.length >= 2);
  assert.strictEqual(run.summary.total_cases, run.cases.length);
  assert.ok(run.cases.some((item) => item.matched_intent === "privacy_concern"));
  assert.ok(run.conversation.some((turn) => turn.speaker === "agent"));
}

function testRefusalPersonaStopsSafely() {
  const persona = personas.find((item) => item.persona_id === "refusal_stop_contact_user");
  const run = runPersonaSparring({ persona, seed: "refusal-test" });
  assert.ok(run.cases.some((item) => item.should_stop_contact));
  assert.ok(run.cases.some((item) => item.risk_level === "high"));
}

testPersonasHaveScripts();
testSeededChoiceIsRepeatable();
testNextPersonaTurnUsesScript();
testSparringRunProducesReviewCases();
testRefusalPersonaStopsSafely();

console.log("Persona sparring checks passed.");
