const path = require("path");
const { simulateTurn } = require("./engine");

function parseArgs(argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 1) {
    const part = argv[index];
    if (part.startsWith("--")) {
      const key = part.slice(2);
      const next = argv[index + 1];
      if (!next || next.startsWith("--")) {
        args[key] = true;
      } else {
        args[key] = next;
        index += 1;
      }
    }
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.text) {
    console.error('Usage: node src/simulator.js --text "user utterance" [--config configs]');
    process.exit(1);
  }

  const configDir = args.config
    ? path.resolve(process.cwd(), args.config)
    : path.join(__dirname, "..", "configs");

  const result = simulateTurn(args.text, { configDir });
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main();
}
