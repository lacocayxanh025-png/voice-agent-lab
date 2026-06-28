const assert = require("assert");
const fs = require("fs");
const path = require("path");

const reviewPath = path.join(__dirname, "..", "examples", "synthetic_review_runs.json");
const data = JSON.parse(fs.readFileSync(reviewPath, "utf8"));

assert.strictEqual(data.version, "0.2.0");
assert.ok(Array.isArray(data.runs), "runs should be an array");
assert.ok(data.runs.length >= 2, "review data should include at least two runs");

for (const run of data.runs) {
  assert.ok(run.run_id, "run_id is required");
  assert.ok(run.label, "run label is required");
  assert.ok(["passed", "needs_review"].includes(run.status), "run status should be stable");
  assert.ok(run.summary, "run summary is required");
  assert.ok(Array.isArray(run.cases), "run cases should be an array");
  assert.strictEqual(run.summary.total_cases, run.cases.length, "summary total should match case count");

  const countedReview = run.cases.filter((item) => item.status === "needs_review").length;
  const countedHighRisk = run.cases.filter((item) => item.risk_level === "high").length;
  const countedHandoff = run.cases.filter((item) => item.handoff_required).length;

  assert.strictEqual(run.summary.needs_review, countedReview, "needs_review count should match cases");
  assert.strictEqual(run.summary.high_risk, countedHighRisk, "high_risk count should match cases");
  assert.strictEqual(run.summary.handoff_required, countedHandoff, "handoff_required count should match cases");

  for (const item of run.cases) {
    assert.ok(item.case_id, "case_id is required");
    assert.ok(item.input_text, "input_text is required");
    assert.ok(item.expected_intent, "expected_intent is required");
    assert.ok(item.matched_intent, "matched_intent is required");
    assert.ok(item.next_node, "next_node is required");
    assert.ok(["low", "medium", "high"].includes(item.risk_level), "risk_level should be stable");
    assert.ok(["passed", "needs_review"].includes(item.status), "case status should be stable");
    assert.ok(Array.isArray(item.issue_tags), "issue_tags should be an array");
    assert.ok(typeof item.response_text === "string", "response_text should be a string");
  }
}

console.log("Review data checks passed.");
