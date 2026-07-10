import { FormEvent, ReactNode, useState } from "react";
import type { GraphData } from "../types";
import {
  ASK_MODELS,
  AskModel,
  AskReference,
  AskResult,
  DEFAULT_ASK_MODEL,
  askGlobe,
} from "../lib/askGlobe";

interface Props {
  graph: GraphData;
  result: AskResult | null;
  onResult: (result: AskResult | null) => void;
  onSelectNode: (id: string) => void;
}

/**
 * Render the answer with each referenced entity name as a clickable link.
 * References are matched at their first non-overlapping occurrence; text
 * the model didn't quote verbatim was already filtered out upstream.
 */
function linkifyAnswer(
  answer: string,
  references: AskReference[],
  onSelectNode: (id: string) => void
): ReactNode[] {
  const spans: { start: number; end: number; nodeId: string }[] = [];
  for (const ref of references) {
    const start = answer.indexOf(ref.text);
    if (start < 0) continue;
    const end = start + ref.text.length;
    if (spans.some((s) => start < s.end && end > s.start)) continue;
    spans.push({ start, end, nodeId: ref.nodeId });
  }
  spans.sort((a, b) => a.start - b.start);

  const parts: ReactNode[] = [];
  let pos = 0;
  for (const s of spans) {
    if (s.start > pos) parts.push(answer.slice(pos, s.start));
    parts.push(
      <button key={s.start} className="ask-link" onClick={() => onSelectNode(s.nodeId)}>
        {answer.slice(s.start, s.end)}
      </button>
    );
    pos = s.end;
  }
  if (pos < answer.length) parts.push(answer.slice(pos));
  return parts;
}

const KEY_STORAGE = "ask-globe-api-key";
const MODEL_STORAGE = "ask-globe-model";

/**
 * Dev convenience: VITE_ANTHROPIC_API_KEY from frontend/.env.local
 * (gitignored). Restricted to the dev server on purpose — VITE_ vars are
 * baked into production bundles, which would publish the key if the built
 * site were ever hosted.
 */
const ENV_KEY: string = import.meta.env.DEV
  ? (import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined) ?? ""
  : "";

export default function AskGlobe({ graph, result, onResult, onSelectNode }: Props) {
  const [question, setQuestion] = useState("");
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem(KEY_STORAGE) || ENV_KEY
  );
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
          <p>{linkifyAnswer(result.answer, result.references, onSelectNode)}</p>
          <span className="ask-meta">
            {result.affected.nodes.size} nodes · {result.affected.edges.size} flows highlighted
            {result.droppedIds.length > 0 &&
              ` · ${result.droppedIds.length} unknown id${result.droppedIds.length > 1 ? "s" : ""} dropped`}
          </span>
        </div>
      )}
      {error && <div className="ask-error">{error}</div>}
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
