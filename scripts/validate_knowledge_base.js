const fs = require("fs");
const path = require("path");
const { validateValue } = require("../src/schema_validator");
const { normalizeKnowledgeItem } = require("../src/adapters/knowledge_base_adapter");

const root = path.join(__dirname, "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function validateKnowledgeBase() {
  const value = readJson("examples/knowledge_base.json");
  const schema = readJson("schemas/knowledge_item.schema.json");
  const errors = [];
  const ids = new Set();

  if (!Array.isArray(value.items) || value.items.length < 1) {
    errors.push("examples/knowledge_base.json must contain at least one item");
    return errors;
  }

  value.items.forEach((item, index) => {
    const itemPath = `examples/knowledge_base.json.items[${index}]`;
    errors.push(...validateValue(item, schema, itemPath));
    try {
      normalizeKnowledgeItem(item, index);
    } catch (error) {
      errors.push(`${itemPath}: ${error.message}`);
    }

    if (ids.has(item.id)) errors.push(`${itemPath} duplicate id: ${item.id}`);
    ids.add(item.id);
  });

  return errors;
}

function main() {
  const errors = validateKnowledgeBase();
  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  console.log("Knowledge base validation passed.");
}

if (require.main === module) main();

module.exports = { validateKnowledgeBase };
