const assert = require("assert");
const path = require("path");
const {
  readJsonl,
  normalizeAction,
  targetFileForAction,
  toCandidate,
  buildCandidateRules
} = require("../src/improvement_workbench");

const root = path.join(__dirname, "..");
const records = readJsonl(path.join(root, "examples", "improvement_queue.jsonl"));

function testRecordsLoad() {
  assert.ok(records.length >= 2, "expected at least two improvement records");
  assert.ok(records.every((record) => record.record_id), "records need stable ids");
}

function testActionMapping() {
  assert.strictEqual(normalizeAction(records[0]), "add_intent");
  assert.strictEqual(normalizeAction(records[1]), "add_regression_case");
  assert.strictEqual(targetFileForAction("add_keyword"), "configs/intents.json");
  assert.strictEqual(targetFileForAction("rewrite_response"), "configs/responses.json");
}

function testCandidateShape() {
  const candidate = toCandidate(records[0]);
  assert.ok(candidate.candidate_id.includes(records[0].record_id));
  assert.strictEqual(candidate.from_record_id, records[0].record_id);
  assert.strictEqual(candidate.target_file, "configs/intents.json");
  assert.strictEqual(candidate.review_status, "reviewing");
  assert.ok(candidate.proposed_change.action);
}

function testCandidateRulesCollection() {
  const result = buildCandidateRules(records);
  assert.strictEqual(result.version, "0.4.0");
  assert.strictEqual(result.candidates.length, records.length);
  assert.ok(result.candidates.some((item) => item.proposed_change.action === "add_regression_case"));
}

testRecordsLoad();
testActionMapping();
testCandidateShape();
testCandidateRulesCollection();

console.log("Improvement workbench checks passed.");
