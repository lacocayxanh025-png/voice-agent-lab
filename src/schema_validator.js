function typeMatches(value, expectedType) {
  if (Array.isArray(expectedType)) {
    return expectedType.some((item) => typeMatches(value, item));
  }

  if (expectedType === "array") return Array.isArray(value);
  if (expectedType === "null") return value === null;
  if (expectedType === "integer") return Number.isInteger(value);
  if (expectedType === "number") return typeof value === "number" && Number.isFinite(value);
  return typeof value === expectedType;
}

function pathJoin(base, key) {
  if (base === "$") return `${base}.${key}`;
  return `${base}.${key}`;
}

function validateValue(value, schema, path = "$") {
  const errors = [];

  if (!schema || typeof schema !== "object") {
    return errors;
  }

  if (schema.type && !typeMatches(value, schema.type)) {
    errors.push(`${path} must be ${Array.isArray(schema.type) ? schema.type.join(" or ") : schema.type}`);
    return errors;
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${path} must be one of ${schema.enum.join(", ")}`);
  }

  if (typeof value === "string") {
    if (schema.minLength && value.length < schema.minLength) {
      errors.push(`${path} must have at least ${schema.minLength} characters`);
    }
    if (schema.pattern && !(new RegExp(schema.pattern).test(value))) {
      errors.push(`${path} must match ${schema.pattern}`);
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems && value.length < schema.minItems) {
      errors.push(`${path} must have at least ${schema.minItems} items`);
    }
    if (schema.items) {
      value.forEach((item, index) => {
        errors.push(...validateValue(item, schema.items, `${path}[${index}]`));
      });
    }
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const requiredKey of schema.required || []) {
      if (!(requiredKey in value)) {
        errors.push(`${path}.${requiredKey} is required`);
      }
    }

    const properties = schema.properties || {};
    for (const [key, item] of Object.entries(value)) {
      if (properties[key]) {
        errors.push(...validateValue(item, properties[key], pathJoin(path, key)));
      } else if (schema.additionalProperties === false) {
        errors.push(`${path}.${key} is not allowed`);
      }
    }
  }

  return errors;
}

module.exports = {
  validateValue
};
