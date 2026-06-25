const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { simulateTurn } = require("../src/engine");

const root = path.join(__dirname, "..");
const configDir = path.join(root, "configs");

function testExpectedFixtures() {
  const fixturePath = path.join(root, "examples", "synthetic_turns.jsonl");
  const rows = fs.readFileSync(fixturePath, "utf8")
    .trim()
    .split(/\r?\n/)
    .map((line) => JSON.parse(line));

  for (const row of rows) {
    const result = simulateTurn(row.text, { configDir });
    assert.strictEqual(result.matched_intent.intent_id, row.expected_intent, row.text);
    assert.strictEqual(result.next_node, row.expected_node, row.text);
  }
}

function testStopContactIsTerminal() {
  const result = simulateTurn("Please remove me and do not call again", { configDir });
  assert.strictEqual(result.next_node, "safe_stop");
  assert.strictEqual(result.should_stop_contact, true);
  assert.strictEqual(result.terminal, true);
  assert.strictEqual(result.risk_level, "high");
}

function testUnknownCreatesImprovementHint() {
  const result = simulateTurn("blue triangle calendar warehouse", { configDir });
  assert.strictEqual(result.matched_intent.intent_id, "unknown");
  assert.strictEqual(result.needs_improvement_queue, true);
  assert.strictEqual(result.improvement_hint.problem_type, "intent_match_error");
}

function testPrivacyDoesNotForceHandoff() {
  const result = simulateTurn("Why are you asking for my data?", { configDir });
  assert.strictEqual(result.matched_intent.intent_id, "privacy_concern");
  assert.strictEqual(result.should_handoff, false);
  assert.strictEqual(result.risk_level, "medium");
}

testExpectedFixtures();
testStopContactIsTerminal();
testUnknownCreatesImprovementHint();
testPrivacyDoesNotForceHandoff();

console.log("All tests passed.");
