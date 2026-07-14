const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { simulateTurn } = require("../src/engine");
const { validateSyntheticPacks } = require("../scripts/validate_config");

const root = path.join(__dirname, "..");
const configDir = path.join(root, "configs");

function listJsonlFiles(dir) {
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

function readRows(filePath) {
  return fs.readFileSync(filePath, "utf8")
    .trim()
    .split(/\r?\n/)
    .map((line) => JSON.parse(line));
}

function testPacksValidate() {
  const errors = validateSyntheticPacks();
  assert.deepStrictEqual(errors, []);
}

function testPacksMatchEngine() {
  const packDir = path.join(root, "examples", "packs");
  const rows = listJsonlFiles(packDir).flatMap(readRows);
  assert.ok(rows.length >= 28, "expected at least twenty-eight synthetic pack rows");

  for (const row of rows) {
    const result = simulateTurn(row.text, { configDir });
    assert.strictEqual(result.matched_intent.intent_id, row.expected_intent, row.text);
    assert.strictEqual(result.next_node, row.expected_node, row.text);
  }
}

testPacksValidate();
testPacksMatchEngine();

console.log("Synthetic pack checks passed.");
