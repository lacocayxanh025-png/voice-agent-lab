const assert = require("assert");
const path = require("path");
const { readJson, readJsonl, buildEvaluationReport } = require("../src/evaluation_report");

const root = path.join(__dirname, "..");
const reviewData = readJson(path.join(root, "examples", "synthetic_review_runs.json"));
const queueRecords = readJsonl(path.join(root, "examples", "improvement_queue.jsonl"));
const report = buildEvaluationReport({
  runs: reviewData.runs,
  improvementRecords: queueRecords,
  version: "0.8.0",
  generatedAt: "2026-01-01T00:00:00.000Z"
});

assert.strictEqual(report.report_type, "synthetic_evaluation");
assert.strictEqual(report.source.run_count, 3);
assert.strictEqual(report.metrics.total_cases, 11);
assert.strictEqual(report.metrics.passed_cases, 7);
assert.strictEqual(report.metrics.needs_review_cases, 4);
assert.strictEqual(report.metrics.pass_rate, 0.6364);
assert.strictEqual(report.metrics.high_risk_cases, 1);
assert.strictEqual(report.metrics.handoff_required_cases, 1);
assert.strictEqual(report.metrics.handoff_recommended_cases, 1);
assert.strictEqual(report.metrics.unknown_intent_cases, 2);
assert.strictEqual(report.metrics.candidate_review_records, 2);
assert.strictEqual(report.issue_tags.unknown, 2);
assert.strictEqual(report.problem_types.intent_match_error, 2);
assert.strictEqual(report.runs.length, 3);
assert.strictEqual(report.runs[0].pass_rate, 0.6);

console.log("Evaluation report checks passed.");
