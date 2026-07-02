const path = require("path");
const { writeCandidateRules } = require("../src/improvement_workbench");

function parseArgs(argv) {
  const args = {
    input: path.join(__dirname, "..", "examples", "improvement_queue.jsonl"),
    output: path.join(__dirname, "..", "tmp", "candidate_rules.generated.json"),
    version: "0.4.0"
  };

  for (let index = 2; index < argv.length; index += 1) {
    const item = argv[index];
    if (item === "--input") args.input = argv[++index];
    if (item === "--output") args.output = argv[++index];
    if (item === "--version") args.version = argv[++index];
  }

  return args;
}

function main() {
  const args = parseArgs(process.argv);
  const result = writeCandidateRules(args);
  console.log(`Wrote ${result.candidates.length} candidate rules to ${args.output}`);
}

main();
