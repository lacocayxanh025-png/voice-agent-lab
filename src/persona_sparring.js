const fs = require("fs");
const path = require("path");
const { simulateTurn } = require("./engine");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadPersonas(filePath = path.join(__dirname, "..", "examples", "personas.json")) {
  const data = readJson(filePath);
  return Array.isArray(data.personas) ? data.personas : [];
}

function hashSeed(seed) {
  const input = String(seed || "voice-agent-lab");
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed) {
  let state = hashSeed(seed);
  return function random() {
    state = Math.imul(state + 0x6d2b79f5, 1);
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function choose(items, random, fallback = null) {
  if (!Array.isArray(items) || items.length === 0) return fallback;
  const index = Math.floor(random() * items.length) % items.length;
  return items[index];
}

function getScriptedTurn(persona, turnIndex, random) {
  const script = persona.scripted_turns || [];
  const scripted = script[turnIndex];
  if (!scripted) return null;

  const text = Array.isArray(scripted.text_pool)
    ? choose(scripted.text_pool, random, scripted.text_pool[0])
    : scripted.text;

  return {
    text,
    pressure_type: scripted.pressure_type || "scripted",
    expected_intent: scripted.expected_intent || null,
    should_stop: Boolean(scripted.should_stop)
  };
}

function nextPersonaTurn({ persona, conversation = [], turnIndex = 0, random = Math.random }) {
  const maxTurns = persona.max_turns || 6;
  if (turnIndex >= maxTurns) {
    return {
      text: "",
      persona_id: persona.persona_id,
      pressure_type: "max_turns",
      should_stop: true
    };
  }

  const lastAgent = [...conversation].reverse().find((turn) => turn.speaker === "agent");
  if (lastAgent?.result?.should_stop_contact) {
    return {
      text: "",
      persona_id: persona.persona_id,
      pressure_type: "stop_contact_acknowledged",
      should_stop: true
    };
  }

  const scripted = getScriptedTurn(persona, turnIndex, random);
  if (!scripted) {
    return {
      text: "",
      persona_id: persona.persona_id,
      pressure_type: "script_complete",
      should_stop: true
    };
  }

  return {
    ...scripted,
    persona_id: persona.persona_id,
    should_stop: scripted.should_stop
  };
}

function summarizeCases(cases) {
  return {
    total_cases: cases.length,
    passed: cases.filter((item) => item.status === "passed").length,
    needs_review: cases.filter((item) => item.status === "needs_review").length,
    high_risk: cases.filter((item) => item.risk_level === "high").length,
    handoff_required: cases.filter((item) => item.handoff_required).length
  };
}

function runPersonaSparring({
  persona,
  configDir = path.join(__dirname, "..", "configs"),
  seed = "voice-agent-lab",
  runId = null
}) {
  if (!persona || !persona.persona_id) {
    throw new Error("A persona with persona_id is required.");
  }

  const random = createSeededRandom(`${seed}:${persona.persona_id}`);
  const conversation = [];
  const cases = [];
  const maxTurns = persona.max_turns || 6;

  for (let turnIndex = 0; turnIndex < maxTurns; turnIndex += 1) {
    const personaTurn = nextPersonaTurn({ persona, conversation, turnIndex, random });
    if (personaTurn.should_stop && !personaTurn.text) break;

    const result = simulateTurn(personaTurn.text, { configDir });
    const expectedIntent = personaTurn.expected_intent || result.matched_intent.intent_id;
    const status = result.matched_intent.intent_id === expectedIntent && !result.needs_improvement_queue
      ? "passed"
      : "needs_review";

    conversation.push({
      speaker: "persona",
      turn_index: turnIndex + 1,
      text: personaTurn.text,
      pressure_type: personaTurn.pressure_type
    });
    conversation.push({
      speaker: "agent",
      turn_index: turnIndex + 1,
      text: result.response_text,
      result
    });

    cases.push({
      case_id: `${persona.persona_id}-turn-${String(turnIndex + 1).padStart(2, "0")}`,
      turn_index: turnIndex + 1,
      input_text: personaTurn.text,
      expected_intent: expectedIntent,
      matched_intent: result.matched_intent.intent_id,
      next_node: result.next_node,
      risk_level: result.risk_level,
      status,
      issue_tags: [
        personaTurn.pressure_type,
        result.risk_level === "high" ? "high-risk" : null,
        result.should_handoff ? "handoff" : null
      ].filter(Boolean),
      handoff_required: result.should_handoff,
      handoff_recommended: result.handoff_recommended,
      should_stop_contact: result.should_stop_contact,
      response_text: result.response_text,
      improvement_hint: result.improvement_hint
    });

    if (personaTurn.should_stop || result.terminal) break;
  }

  return {
    run_id: runId || `sparring-${persona.persona_id}`,
    label: `${persona.label} sparring run`,
    scenario: persona.scenario_goal,
    persona: persona.label,
    status: cases.some((item) => item.status === "needs_review") ? "needs_review" : "passed",
    created_at: "2026-01-01T00:00:00.000Z",
    summary: summarizeCases(cases),
    cases,
    conversation
  };
}

module.exports = {
  loadPersonas,
  createSeededRandom,
  nextPersonaTurn,
  runPersonaSparring,
  summarizeCases
};
