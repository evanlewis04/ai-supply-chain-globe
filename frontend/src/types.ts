// Mirrors schema/*.schema.json — the typed boundary between vault data and UI.

export type Layer = "energy" | "chips" | "infrastructure" | "models" | "applications";

export interface SourceRef {
  url: string;
  title?: string;
  date: string;
  quote?: string;
  supports?: string;
}

export interface NodeLocation {
  lat: number;
  lon: number;
  country: string;
  region?: string;
  precision?: "site" | "city" | "region";
}

export interface Ticker {
  symbol: string;
  exchange?: string;
}

export interface ValueStamp {
  value: number | null;
  unit: string | null;
  as_of: string;
}

export interface GraphNode {
  id: string;
  name: string;
  layer: Layer;
  type: string;
  operator?: string;
  ticker?: Ticker;
  location: NodeLocation;
  capacity?: ValueStamp;
  status: string;
  constraints?: string[];
  tags?: string[];
  sources: SourceRef[];
  body?: string;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  flow_type: string;
  volume?: ValueStamp;
  lead_time_weeks?: number | null;
  constraint_level?: "low" | "medium" | "high";
  substitutability?: "low" | "medium" | "high";
  constraints?: string[];
  notes?: string;
  sources: SourceRef[];
  body?: string;
}

export interface Constraint {
  id: string;
  name: string;
  category: string;
  description: string;
  metrics?: { value: number | null; unit: string | null; as_of: string; note?: string }[];
  severity?: string;
  tags?: string[];
  sources: SourceRef[];
  body?: string;
}

export interface GraphData {
  meta: { generated_at: string; counts: Record<string, number>; schema_version: string };
  nodes: GraphNode[];
  edges: GraphEdge[];
  constraints: Constraint[];
}

export interface PriceSeries {
  currency: string;
  exchange?: string;
  points: [string, number][];
  first_close: number;
  last_close: number;
  change_pct: number | null;
}

export interface PricesData {
  meta: { fetched_at: string; source: string; period: string; interval: string; note?: string };
  series: Record<string, PriceSeries>;
}

export const LAYER_COLORS: Record<Layer, string> = {
  energy: "#f6c945",
  chips: "#4cc9f0",
  infrastructure: "#9d4edd",
  models: "#57cc99",
  applications: "#ff70a6", // rose — kept off red so #ff4d4d stays unique to chokepoints
};

export const LAYER_LABELS: Record<Layer, string> = {
  energy: "Energy",
  chips: "Chips",
  infrastructure: "Infrastructure",
  models: "Models",
  applications: "Applications",
};

export const FLOW_COLORS: Record<string, string> = {
  equipment: "#e0aaff",
  wafers: "#4cc9f0",
  chips: "#3a86ff",
  packaged_modules: "#56cfe1",
  memory: "#ffd166",
  substrates: "#f4a261",
  materials: "#d4a373",
  servers: "#80ffdb",
  power: "#f6c945",
  water: "#90e0ef",
  bandwidth: "#b5179e",
  compute: "#57cc99",
  tokens: "#ff6b6b",
  dollars: "#94d2bd",
  model_weights: "#57cc99",
};
