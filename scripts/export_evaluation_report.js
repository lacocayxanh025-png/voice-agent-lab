const path = require("path");
const { writeEvaluationReport } = require("../src/evaluation_report");

function parseArgs(argv) {
  const args = {
    reviewInput: path.join(__dirname, "..", "examples", "synthetic_review_runs.json"),
    queueInput: path.join(__dirname, "..", "examples", "improvement_queue.jsonl"),
    output: path.join(__dirname, "..", "examples", "evaluation_report.json"),
    version: "0.8.0"
  };

  for (let index = 2; index < argv.length; index += 1) {
    const item = argv[index];
    if (item === "--review") args.reviewInput = argv[++index];
    if (item === "--queue") args.queueInput = argv[++index];
    if (item === "--output") args.output = argv[++index];
    if (item === "--version") args.version = argv[++index];
    if (item === "--generated-at") args.generatedAt = argv[++index];
  }

  return args;
}

function main() {
  const args = parseArgs(process.argv);
  const result = writeEvaluationReport(args);
  console.log(`Wrote evaluation report for ${result.metrics.total_cases} cases to ${args.output}`);
}

main();
