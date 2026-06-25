const fs = require("fs");
const path = require("path");
const { simulateTurn } = require("../src/engine");

function parseArgs(argv) {
  const args = {
    input: path.join(__dirname, "..", "examples", "synthetic_turns.jsonl"),
    output: path.join(__dirname, "..", "tmp", "improvement_queue.generated.jsonl")
  };

  for (let i = 2; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--input") args.input = argv[++i];
    if (item === "--output") args.output = argv[++i];
  }

  return args;
}

function readJsonl(filePath) {
  return fs.readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function severityFor(result) {
  if (result.risk_level === "high") return "high";
  if (result.matched_intent.intent_id === "unknown") return "medium";
  return "low";
}

function actionFor(result) {
  if (result.matched_intent.intent_id === "unknown") {
    return {
      action_type: "add_intent",
      note: "Review the utterance and decide whether to add a new intent or keywords to an existing intent."
    };
  }

  if (result.risk_level === "high") {
    return {
      action_type: "add_regression_case",
      note: "Keep this high-risk path covered by regression tests before changing response rules."
    };
  }

  return {
    action_type: "reject",
    note: "No improvement action is required."
  };
}

function toRecord(row, index) {
  const text = String(row.text || row.input_text || "").trim();
  const result = simulateTurn(text);
  if (!result.needs_improvement_queue) return null;

  return {
    record_id: `synthetic-${String(index + 1).padStart(4, "0")}`,
    source: "synthetic_regression",
    problem_type: result.improvement_hint.problem_type,
    severity: severityFor(result),
    evidence: {
      text,
      matched_intent: result.matched_intent.intent_id,
      node: result.next_node,
      notes: result.improvement_hint.note
    },
    suggested_action: actionFor(result),
    status: "new",
    created_at: new Date().toISOString()
  };
}

function main() {
  const args = parseArgs(process.argv);
  const rows = readJsonl(args.input);
  const records = rows.map(toRecord).filter(Boolean);
  fs.mkdirSync(path.dirname(args.output), { recursive: true });
  fs.writeFileSync(args.output, records.map((record) => JSON.stringify(record)).join("\n") + "\n", "utf8");
  console.log(`Wrote ${records.length} improvement records to ${args.output}`);
}

main();
