const fs = require("fs");
const path = require("path");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonl(filePath) {
  return fs.readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function roundRate(value) {
  return Number(value.toFixed(4));
}

function increment(map, key) {
  const normalizedKey = String(key || "unknown");
  map[normalizedKey] = (map[normalizedKey] || 0) + 1;
}

function summarizeRun(run) {
  const cases = Array.isArray(run.cases) ? run.cases : [];
  const passed = cases.filter((item) => item.status === "passed").length;
  const needsReview = cases.filter((item) => item.status === "needs_review").length;
  const highRisk = cases.filter((item) => item.risk_level === "high").length;
  const handoffRequired = cases.filter((item) => item.handoff_required === true).length;
  const handoffRecommended = cases.filter((item) => item.handoff_recommended === true).length;
  const unknownIntent = cases.filter((item) => (
    item.expected_intent === "unknown" || item.matched_intent === "unknown"
  )).length;

  return {
    run_id: String(run.run_id || "unknown-run"),
    label: String(run.label || "Unnamed run"),
    status: String(run.status || "needs_review"),
    total_cases: cases.length,
    passed_cases: passed,
    needs_review_cases: needsReview,
    high_risk_cases: highRisk,
    handoff_required_cases: handoffRequired,
    handoff_recommended_cases: handoffRecommended,
    unknown_intent_cases: unknownIntent,
    pass_rate: cases.length ? roundRate(passed / cases.length) : 0
  };
}

function buildEvaluationReport({ runs, improvementRecords = [], version = "0.8.0", generatedAt = "2026-01-01T00:00:00.000Z" }) {
  if (!Array.isArray(runs)) throw new Error("Review runs must be an array.");

  const cases = runs.flatMap((run) => Array.isArray(run.cases) ? run.cases : []);
  const totalCases = cases.length;
  const passedCases = cases.filter((item) => item.status === "passed").length;
  const needsReviewCases = cases.filter((item) => item.status === "needs_review").length;
  const highRiskCases = cases.filter((item) => item.risk_level === "high").length;
  const handoffRequiredCases = cases.filter((item) => item.handoff_required === true).length;
  const handoffRecommendedCases = cases.filter((item) => item.handoff_recommended === true).length;
  const unknownIntentCases = cases.filter((item) => (
    item.expected_intent === "unknown" || item.matched_intent === "unknown"
  )).length;
  const issueTags = {};
  const problemTypes = {};

  for (const item of cases) {
    for (const tag of Array.isArray(item.issue_tags) ? item.issue_tags : []) increment(issueTags, tag);
    const problemType = item.improvement_hint?.problem_type;
    if (problemType) increment(problemTypes, problemType);
  }

  return {
    version,
    report_type: "synthetic_evaluation",
    description: "Reviewable metrics generated from synthetic conversation runs. This report does not change production policy or write back to a customer knowledge base.",
    generated_at: generatedAt,
    source: {
      run_count: runs.length,
      case_count: totalCases,
      improvement_record_count: Array.isArray(improvementRecords) ? improvementRecords.length : 0
    },
    metrics: {
      total_runs: runs.length,
      total_cases: totalCases,
      passed_cases: passedCases,
      needs_review_cases: needsReviewCases,
      pass_rate: totalCases ? roundRate(passedCases / totalCases) : 0,
      needs_review_rate: totalCases ? roundRate(needsReviewCases / totalCases) : 0,
      high_risk_cases: highRiskCases,
      high_risk_rate: totalCases ? roundRate(highRiskCases / totalCases) : 0,
      handoff_required_cases: handoffRequiredCases,
      handoff_required_rate: totalCases ? roundRate(handoffRequiredCases / totalCases) : 0,
      handoff_recommended_cases: handoffRecommendedCases,
      handoff_recommended_rate: totalCases ? roundRate(handoffRecommendedCases / totalCases) : 0,
      unknown_intent_cases: unknownIntentCases,
      unknown_intent_rate: totalCases ? roundRate(unknownIntentCases / totalCases) : 0,
      candidate_review_records: Array.isArray(improvementRecords) ? improvementRecords.length : 0
    },
    issue_tags: issueTags,
    problem_types: problemTypes,
    runs: runs.map(summarizeRun)
  };
}

function writeEvaluationReport({ reviewInput, queueInput, output, version = "0.8.0", generatedAt }) {
  const reviewData = readJson(reviewInput);
  const improvementRecords = queueInput ? readJsonl(queueInput) : [];
  const report = buildEvaluationReport({
    runs: reviewData.runs,
    improvementRecords,
    version,
    generatedAt: generatedAt || reviewData.generated_at || "2026-01-01T00:00:00.000Z"
  });

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return report;
}

module.exports = {
  readJson,
  readJsonl,
  roundRate,
  summarizeRun,
  buildEvaluationReport,
  writeEvaluationReport
};
