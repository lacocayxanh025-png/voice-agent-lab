const path = require("path");
const { loadPersonas, runPersonaSparring } = require("./persona_sparring");

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
  const personasPath = args.personas
    ? path.resolve(process.cwd(), args.personas)
    : path.join(__dirname, "..", "examples", "personas.json");
  const configDir = args.config
    ? path.resolve(process.cwd(), args.config)
    : path.join(__dirname, "..", "configs");

  const personas = loadPersonas(personasPath);
  const selected = args.persona
    ? personas.find((persona) => persona.persona_id === args.persona)
    : personas[0];

  if (!selected) {
    console.error("No persona found. Use --persona with a valid persona_id.");
    process.exit(1);
  }

  const run = runPersonaSparring({
    persona: selected,
    configDir,
    seed: args.seed || "voice-agent-lab"
  });

  console.log(JSON.stringify(run, null, 2));
}

if (require.main === module) {
  main();
}
