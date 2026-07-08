const fs = require("fs");
const path = require("path");
const { validateValue } = require("../src/schema_validator");
const { simulateTurn } = require("../src/engine");

const root = path.join(__dirname, "..");

const configTargets = [
  ["configs/intents.json", "schemas/config_intents.schema.json"],
  ["configs/responses.json", "schemas/config_responses.schema.json"],
  ["configs/dialogue_flow.json", "schemas/config_dialogue_flow.schema.json"]
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function listJsonlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listJsonlFiles(fullPath));
    } else if (entry.name.endsWith(".jsonl")) {
      files.push(fullPath);
    }
  }
  return files;
}

function parseJsonl(filePath) {
  return fs.readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`${path.relative(root, filePath)}:${index + 1} is not valid JSON`);
      }
    });
}

function validateConfigFiles() {
  const errors = [];
  for (const [target, schemaPath] of configTargets) {
    const value = readJson(target);
    const schema = readJson(schemaPath);
    errors.push(...validateValue(value, schema, target));
  }
  errors.push(...validateConfigReferences());
  return errors;
}

function validateConfigReferences() {
  const errors = [];
  const intents = readJson("configs/intents.json");
  const responses = readJson("configs/responses.json");
  const flow = readJson("configs/dialogue_flow.json");

  const intentIds = new Set();
  const nodeIds = new Set(Object.keys(flow.nodes || {}));
  const responseIds = new Set(Object.keys(responses.responses || {}));

  for (const intent of intents.intents || []) {
    if (intentIds.has(intent.id)) {
      errors.push(`configs/intents.json duplicate intent id: ${intent.id}`);
    }
    intentIds.add(intent.id);

    if (!nodeIds.has(intent.default_next_node)) {
      errors.push(`configs/intents.json intent ${intent.id} points to missing node ${intent.default_next_node}`);
    }
  }

  if (!intentIds.has("unknown")) {
    errors.push("configs/intents.json must include an unknown intent");
  }

  if (!nodeIds.has(flow.start_node)) {
    errors.push(`configs/dialogue_flow.json start_node is missing from nodes: ${flow.start_node}`);
  }

  if (!nodeIds.has(flow.default_node)) {
    errors.push(`configs/dialogue_flow.json default_node is missing from nodes: ${flow.default_node}`);
  }

  for (const nodeId of nodeIds) {
    if (!responseIds.has(nodeId)) {
      errors.push(`configs/responses.json is missing response for node ${nodeId}`);
    }
  }

  for (const [responseId, response] of Object.entries(responses.responses || {})) {
    if (!nodeIds.has(responseId)) {
      errors.push(`configs/responses.json response has no matching flow node: ${responseId}`);
    }
    if (typeof response.text !== "string" || response.text.length < 5) {
      errors.push(`configs/responses.json response ${responseId} needs text`);
    }
    if (!["low", "medium", "high"].includes(response.risk_level)) {
      errors.push(`configs/responses.json response ${responseId} has invalid risk_level`);
    }
  }

  return errors;
}

function validateSyntheticPacks() {
  const schema = readJson("schemas/synthetic_case.schema.json");
  const intents = readJson("configs/intents.json");
  const flow = readJson("configs/dialogue_flow.json");
  const intentIds = new Set((intents.intents || []).map((intent) => intent.id));
  const nodeIds = new Set(Object.keys(flow.nodes || {}));
  const packDir = path.join(root, "examples", "packs");
  const files = listJsonlFiles(packDir);
  const errors = [];

  for (const filePath of files) {
    parseJsonl(filePath).forEach((row, index) => {
      const rowPath = `${path.relative(root, filePath)}:${index + 1}`;
      errors.push(...validateValue(row, schema, rowPath));
      if (!intentIds.has(row.expected_intent)) {
        errors.push(`${rowPath} references missing intent ${row.expected_intent}`);
      }
      if (!nodeIds.has(row.expected_node)) {
        errors.push(`${rowPath} references missing node ${row.expected_node}`);
      }
      const result = simulateTurn(row.text, { configDir: path.join(root, "configs") });
      if (result.matched_intent.intent_id !== row.expected_intent) {
        errors.push(`${rowPath} expected intent ${row.expected_intent} but matched ${result.matched_intent.intent_id}`);
      }
      if (result.next_node !== row.expected_node) {
        errors.push(`${rowPath} expected node ${row.expected_node} but routed to ${result.next_node}`);
      }
    });
  }

  return errors;
}

function main() {
  const errors = [
    ...validateConfigFiles(),
    ...validateSyntheticPacks()
  ];

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    process.exit(1);
  }

  console.log("Config and synthetic pack validation passed.");
}

if (require.main === module) {
  main();
}

module.exports = {
  validateConfigFiles,
  validateConfigReferences,
  validateSyntheticPacks
};
