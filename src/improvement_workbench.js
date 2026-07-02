const fs = require("fs");
const path = require("path");

function readJsonl(filePath) {
  return fs.readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function slugify(value) {
  return String(value || "candidate")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48) || "candidate";
}

function normalizeAction(record, preferredAction = null) {
  if (preferredAction) return preferredAction;
  const action = record?.suggested_action?.action_type;
  if (action) return action;
  if (record?.problem_type === "intent_match_error") return "add_intent";
  if (record?.problem_type === "safety_or_policy_boundary") return "add_regression_case";
  if (record?.problem_type === "handoff_policy_review") return "add_handoff_rule";
  if (record?.problem_type === "response_quality") return "rewrite_response";
  return "reject";
}

function targetFileForAction(action) {
  if (action === "add_intent" || action === "add_keyword") return "configs/intents.json";
  if (action === "rewrite_response") return "configs/responses.json";
  if (action === "add_handoff_rule") return "configs/dialogue_flow.json";
  if (action === "add_regression_case") return "examples/synthetic_turns.jsonl";
  return "docs/reviewer-notes.md";
}

function buildProposedChange(record, action) {
  const evidence = record.evidence || {};
  const text = String(evidence.text || "").trim();
  const matchedIntent = evidence.matched_intent || "unknown";
  const node = evidence.node || "clarify_once";

  if (action === "add_intent") {
    const intentBase = slugify(text).split("_").slice(0, 4).join("_");
    return {
      action,
      intent_id: `candidate_${intentBase}`,
      label: "Candidate intent from synthetic review",
      keywords: text ? [text] : [],
      default_next_node: node
    };
  }

  if (action === "add_keyword") {
    return {
      action,
      intent_id: matchedIntent === "unknown" ? "review_required" : matchedIntent,
      keywords: text ? [text] : []
    };
  }

  if (action === "rewrite_response") {
    return {
      action,
      node,
      note: record?.suggested_action?.note || "Review response wording for clarity and safety."
    };
  }

  if (action === "add_handoff_rule") {
    return {
      action,
      node,
      handoff_required: true,
      note: record?.suggested_action?.note || "Review whether this path should require or recommend handoff."
    };
  }

  if (action === "add_regression_case") {
    return {
      action,
      text,
      expected_intent: matchedIntent,
      expected_node: node
    };
  }

  return {
    action: "reject",
    note: "No candidate rule should be generated from this record."
  };
}

function toCandidate(record, options = {}) {
  if (!record || !record.record_id) {
    throw new Error("Improvement record with record_id is required.");
  }

  const action = normalizeAction(record, options.action);
  return {
    candidate_id: `candidate-${record.record_id}-${action}`,
    from_record_id: record.record_id,
    severity: record.severity || "low",
    problem_type: record.problem_type || "review_required",
    target_file: targetFileForAction(action),
    proposed_change: buildProposedChange(record, action),
    review_status: action === "reject" ? "rejected" : "reviewing"
  };
}

function buildCandidateRules(records, options = {}) {
  return {
    version: options.version || "0.4.0",
    description: "Synthetic candidate rules generated from improvement queue review. These examples are not production policy.",
    generated_at: options.generatedAt || "2026-01-01T00:00:00.000Z",
    candidates: records.map((record) => toCandidate(record, options))
  };
}

function writeCandidateRules({ input, output, version = "0.4.0" }) {
  const records = readJsonl(input);
  const candidateRules = buildCandidateRules(records, { version });
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(candidateRules, null, 2)}\n`, "utf8");
  return candidateRules;
}

module.exports = {
  readJsonl,
  slugify,
  normalizeAction,
  targetFileForAction,
  buildProposedChange,
  toCandidate,
  buildCandidateRules,
  writeCandidateRules
};
