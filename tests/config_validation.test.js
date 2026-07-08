const assert = require("assert");
const { validateValue } = require("../src/schema_validator");

function testRequiredFieldsFail() {
  const schema = {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" }
    }
  };
  const errors = validateValue({}, schema);
  assert.ok(errors.some((item) => item.includes("$.id is required")));
}

function testEnumFails() {
  const schema = {
    type: "object",
    properties: {
      risk_level: { enum: ["low", "medium", "high"] }
    }
  };
  const errors = validateValue({ risk_level: "urgent" }, schema);
  assert.ok(errors.some((item) => item.includes("risk_level")));
}

function testAdditionalPropertiesFail() {
  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      text: { type: "string" }
    }
  };
  const errors = validateValue({ text: "ok", private_note: "no" }, schema);
  assert.ok(errors.some((item) => item.includes("private_note")));
}

testRequiredFieldsFail();
testEnumFails();
testAdditionalPropertiesFail();

console.log("Config validation checks passed.");
