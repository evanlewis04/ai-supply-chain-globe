import { FormEvent, useState } from "react";
import type { GraphData } from "../types";
import {
  ASK_MODELS,
  AskModel,
  AskResult,
  DEFAULT_ASK_MODEL,
  askGlobe,
} from "../lib/askGlobe";

interface Props {
  graph: GraphData;
  result: AskResult | null;
  onResult: (result: AskResult | null) => void;
}

const KEY_STORAGE = "ask-globe-api-key";
const MODEL_STORAGE = "ask-globe-model";

const SUGGESTIONS = [
  "Why can't Nvidia just make more GPUs?",
  "What happens if another hurricane hits North Carolina?",
  "Which single company failing would stop AI progress fastest?",
  "Why are datacenter buildouts delayed?",
];

export default function AskGlobe({ graph, result, onResult }: Props) {
  const [question, setQuestion] = useState("");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(KEY_STORAGE) ?? "");
  const [model, setModel] = useState<AskModel>(() => {
    const saved = localStorage.getItem(MODEL_STORAGE);
    return saved && saved in ASK_MODELS ? (saved as AskModel) : DEFAULT_ASK_MODEL;
  });
  const [needsKey, setNeedsKey] = useState(false);
  const [keyDraft, setKeyDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async (q: string) => {
    if (!q.trim() || loading) return;
    if (!apiKey) {
      setQuestion(q);
      setNeedsKey(true);
      return;
    }
    setLoading(true);
    setError(null);
    onResult(null);
    try {
      onResult(await askGlobe(apiKey, model, graph, q.trim()));
    } catch (e) {
      const status = (e as { status?: number }).status;
      if (status === 401) {
        localStorage.removeItem(KEY_STORAGE);
        setApiKey("");
        setNeedsKey(true);
        setError("That API key was rejected — enter a valid one.");
      } else {
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    void ask(question);
  };

  const saveKey = (ev: FormEvent) => {
    ev.preventDefault();
    const k = keyDraft.trim();
    if (!k) return;
    localStorage.setItem(KEY_STORAGE, k);
    setApiKey(k);
    setKeyDraft("");
    setNeedsKey(false);
    setError(null);
  };

  return (
    <div className="ask-globe">
      {result && (
        <div className="ask-answer">
          <button className="ask-dismiss" onClick={() => onResult(null)} aria-label="Dismiss answer">
            ×
          </button>
          <p>{result.answer}</p>
          <span className="ask-meta">
            {result.affected.nodes.size} nodes · {result.affected.edges.size} flows highlighted
            {result.droppedIds.length > 0 &&
              ` · ${result.droppedIds.length} unknown id${result.droppedIds.length > 1 ? "s" : ""} dropped`}
          </span>
        </div>
      )}
      {error && <div className="ask-error">{error}</div>}
      {!result && !loading && !needsKey && (
        <div className="ask-suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="ask-chip" onClick={() => void ask(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
      {needsKey ? (
        <form className="ask-bar" onSubmit={saveKey}>
          <input
            type="password"
            value={keyDraft}
            onChange={(ev) => setKeyDraft(ev.target.value)}
            placeholder="Paste your Anthropic API key (stored only in this browser)"
            autoFocus
          />
          <button type="submit" disabled={!keyDraft.trim()}>
            Save key
          </button>
          <button type="button" className="ask-secondary" onClick={() => setNeedsKey(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <form className="ask-bar" onSubmit={onSubmit}>
          <input
            type="text"
            value={question}
            onChange={(ev) => setQuestion(ev.target.value)}
            placeholder="Ask the globe — e.g. why can't Nvidia just make more GPUs?"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !question.trim()}>
            {loading ? "Thinking…" : "Ask"}
          </button>
          <select
            className="ask-model"
            value={model}
            onChange={(ev) => {
              const m = ev.target.value as AskModel;
              setModel(m);
              localStorage.setItem(MODEL_STORAGE, m);
            }}
            title="Model"
          >
            {Object.entries(ASK_MODELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </form>
      )}
    </div>
  );
}
