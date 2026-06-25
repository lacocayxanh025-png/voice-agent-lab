const fs = require("fs");
const path = require("path");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function scoreIntent(text, intent) {
  const normalized = normalizeText(text);
  const hits = [];

  for (const keyword of intent.keywords || []) {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedKeyword && normalized.includes(normalizedKeyword)) {
      hits.push(keyword);
    }
  }

  if (hits.length === 0) {
    return null;
  }

  return {
    intent_id: intent.id,
    label: intent.label,
    priority: intent.priority || 0,
    hits,
    score: hits.length * 10 + (intent.priority || 0)
  };
}

function matchIntent(text, intents) {
  const matches = intents
    .map((intent) => scoreIntent(text, intent))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || b.priority - a.priority);

  if (matches.length > 0) {
    return matches[0];
  }

  const unknown = intents.find((intent) => intent.id === "unknown");
  return {
    intent_id: "unknown",
    label: unknown ? unknown.label : "Unknown or unsupported intent",
    priority: 0,
    hits: [],
    score: 0
  };
}

function loadConfig(configDir) {
  return {
    intents: readJson(path.join(configDir, "intents.json")),
    responses: readJson(path.join(configDir, "responses.json")),
    flow: readJson(path.join(configDir, "dialogue_flow.json"))
  };
}

function buildImprovementHint(match, response, nextNode) {
  if (match.intent_id === "unknown") {
    return {
      problem_type: "intent_match_error",
      suggested_action: "add_intent_or_keyword",
      note: "No intent matched this utterance. Review the text and decide whether it belongs to an existing intent or a new one."
    };
  }

  if (response && response.risk_level === "high") {
    return {
      problem_type: "safety_or_policy_boundary",
      suggested_action: "review_escalation_rule",
      note: `High-risk node '${nextNode}' should be reviewed before broad deployment.`
    };
  }

  return null;
}

function simulateTurn(text, options = {}) {
  const configDir = options.configDir || path.join(__dirname, "..", "configs");
  const config = loadConfig(configDir);

  const match = matchIntent(text, config.intents.intents || []);
  const intent = (config.intents.intents || []).find((item) => item.id === match.intent_id);
  const nextNode = intent?.default_next_node || config.flow.default_node || "clarify_once";
  const response = config.responses.responses[nextNode] || config.responses.responses[config.flow.default_node];
  const node = config.flow.nodes[nextNode] || {};
  const improvementHint = buildImprovementHint(match, response, nextNode);

  return {
    input_text: text,
    matched_intent: match,
    next_node: nextNode,
    response_text: response?.text || "",
    tone: response?.tone || "calm",
    risk_level: response?.risk_level || "medium",
    should_handoff: Boolean(response?.handoff_required || node.handoff_required),
    handoff_recommended: Boolean(response?.handoff_recommended || node.handoff_recommended),
    should_stop_contact: Boolean(response?.stop_contact_required || node.stop_contact_required),
    terminal: Boolean(response?.terminal || node.terminal),
    needs_improvement_queue: Boolean(improvementHint),
    improvement_hint: improvementHint
  };
}

module.exports = {
  normalizeText,
  scoreIntent,
  matchIntent,
  simulateTurn
};
