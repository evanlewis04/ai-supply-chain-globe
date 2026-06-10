import Anthropic from "@anthropic-ai/sdk";
import type { GraphData } from "../types";
import type { AffectedSet } from "../graph/traversal";

export const ASK_MODELS = {
  "claude-haiku-4-5": "Haiku 4.5 (fast & cheap)",
  "claude-sonnet-4-6": "Sonnet 4.6 (smarter)",
} as const;

export type AskModel = keyof typeof ASK_MODELS;
export const DEFAULT_ASK_MODEL: AskModel = "claude-haiku-4-5";

export interface AskResult {
  answer: string;
  /** Validated against the graph — hallucinated ids are dropped. */
  affected: AffectedSet;
  /** A constraint the model judged central to the answer, if any. */
  constraintId: string | null;
  /** Ids the model returned that don't exist in the graph (for transparency). */
  droppedIds: string[];
}

/**
 * Compact graph context for the prompt: everything analytical, minus the
 * source bibliographies and body prose (they dominate the byte count and
 * the model only needs the structured facts to pick paths). Deterministic
 * output — this string is the cached prefix, so it must be byte-stable
 * across calls.
 */
export function buildGraphContext(graph: GraphData): string {
  const nodes = graph.nodes.map((n) => ({
    id: n.id,
    name: n.name,
    layer: n.layer,
    type: n.type,
    operator: n.operator,
    region: n.location.region ?? n.location.country,
    capacity: n.capacity?.value != null ? `${n.capacity.value} ${n.capacity.unit}` : undefined,
    status: n.status,
    constraints: n.constraints?.length ? n.constraints : undefined,
    tags: n.tags?.length ? n.tags : undefined,
  }));
  const edges = graph.edges.map((e) => ({
    id: e.id,
    from: e.from,
    to: e.to,
    flow_type: e.flow_type,
    constraint_level: e.constraint_level,
    substitutability: e.substitutability,
    gated_by: e.constraints?.length ? e.constraints : undefined,
    notes: e.notes,
  }));
  const constraints = graph.constraints.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    severity: c.severity,
    description: c.description,
    metrics: c.metrics?.map((m) => `${m.value} ${m.unit} (as of ${m.as_of})${m.note ? ` — ${m.note}` : ""}`),
  }));
  return JSON.stringify({ nodes, edges, constraints });
}

function systemPrompt(graph: GraphData): string {
  return `You are the analyst behind an interactive 3D globe of the AI supply chain. \
The globe is a directed graph: nodes are real facilities/organizations, edges are typed \
flows between them (wafers, materials, equipment, power, compute...), and constraints \
are first-class bottleneck entities that gate specific edges. Every entity is backed by \
dated public sources in the underlying dataset.

The user asks a question; you answer it AND select which parts of the graph the globe \
should light up to illustrate the answer.

Rules:
- answer: 2-4 sentences, concrete and quantitative where the data allows. Plain prose, \
no markdown. Only claim what the graph data supports; if the graph can't answer, say so \
and return empty id arrays.
- node_ids / edge_ids: the subset of the graph that tells the story of your answer — \
the relevant path(s), not everything. Use ONLY ids that exist in the graph data. Include \
the edges connecting the nodes you select.
- constraint_id: if one constraint entity is central to the answer, its id; else null.

Graph data:
${buildGraphContext(graph)}`;
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    answer: { type: "string" },
    node_ids: { type: "array", items: { type: "string" } },
    edge_ids: { type: "array", items: { type: "string" } },
    constraint_id: { anyOf: [{ type: "string" }, { type: "null" }] },
  },
  required: ["answer", "node_ids", "edge_ids", "constraint_id"],
  additionalProperties: false,
} as const;

export async function askGlobe(
  apiKey: string,
  model: AskModel,
  graph: GraphData,
  question: string
): Promise<AskResult> {
  const client = new Anthropic({
    apiKey,
    // Static site by design: the key is the owner's own, entered at runtime
    // and kept in localStorage — never bundled or committed.
    dangerouslyAllowBrowser: true,
  });

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: systemPrompt(graph),
        // The graph context is identical across questions — cache it so
        // repeat questions only pay for the question itself.
        cache_control: { type: "ephemeral" },
      },
    ],
    output_config: {
      format: { type: "json_schema", schema: RESPONSE_SCHEMA },
    },
    messages: [{ role: "user", content: question }],
  });

  const text = response.content.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("Empty response from the model.");
  const parsed = JSON.parse(text) as {
    answer: string;
    node_ids: string[];
    edge_ids: string[];
    constraint_id: string | null;
  };

  // Ground the response: only ids that exist in the graph may render.
  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  const edgeIds = new Set(graph.edges.map((e) => e.id));
  const constraintIds = new Set(graph.constraints.map((c) => c.id));

  const droppedIds: string[] = [];
  const nodes = new Set<string>();
  for (const id of parsed.node_ids) {
    if (nodeIds.has(id)) nodes.add(id);
    else droppedIds.push(id);
  }
  const edges = new Set<string>();
  for (const id of parsed.edge_ids) {
    if (edgeIds.has(id)) edges.add(id);
    else droppedIds.push(id);
  }
  // An edge's endpoints belong in the highlight even if the model omitted them.
  for (const e of graph.edges) {
    if (edges.has(e.id)) {
      nodes.add(e.from);
      nodes.add(e.to);
    }
  }

  const constraintId =
    parsed.constraint_id && constraintIds.has(parsed.constraint_id) ? parsed.constraint_id : null;
  if (parsed.constraint_id && !constraintId) droppedIds.push(parsed.constraint_id);

  return { answer: parsed.answer, affected: { nodes, edges }, constraintId, droppedIds };
}
