#!/usr/bin/env python3
"""Build pipeline: Obsidian vault -> validated graph.json.

Parses markdown + YAML frontmatter from vault/, validates every entry
against the JSON Schemas in schema/, runs cross-reference checks, and
emits frontend/public/graph.json.

The build FAILS (non-zero exit) on any validation error. This is the
mechanical enforcement of the sourcing standard: no unsourced claims,
no dangling references, no layer/type mismatches.

Usage:
    python scripts/build.py                  # validate + emit graph.json
    python scripts/build.py --validate       # validate only, no output file
    python scripts/build.py --include-pending  # also validate vault/_pending/
                                               # (pending entries are NEVER
                                               #  emitted into graph.json)
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date, datetime, timezone
from pathlib import Path

import frontmatter
from jsonschema import Draft202012Validator
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parent.parent
VAULT = ROOT / "vault"
SCHEMA_DIR = ROOT / "schema"
DEFAULT_OUT = ROOT / "frontend" / "public" / "graph.json"

# Which node types are legal in which layer (cross-check beyond pure schema)
LAYER_TYPES = {
    "energy": {"power_plant", "substation", "grid_region", "gas_pipeline", "water_supply"},
    "chips": {"fab", "packaging_facility", "memory_fab", "equipment_maker", "designer", "substrate_maker"},
    "infrastructure": {"data_center", "ai_factory", "network_hub", "cooling_supplier", "server_assembly"},
    "models": {"training_cluster", "model_artifact", "lab"},
    "applications": {"product", "deployment"},
}


class BuildError:
    def __init__(self, file: Path, message: str):
        self.file = file
        self.message = message

    def __str__(self) -> str:
        try:
            rel = self.file.relative_to(ROOT)
        except ValueError:
            rel = self.file
        return f"  {rel}: {self.message}"


def load_schemas() -> dict[str, Draft202012Validator]:
    """Load the three schemas with a shared registry so $refs across files resolve."""
    resources = {}
    raw = {}
    for name in ("node", "edge", "constraint"):
        schema = json.loads((SCHEMA_DIR / f"{name}.schema.json").read_text(encoding="utf-8"))
        raw[name] = schema
        # Register under both the $id and the bare filename used in $refs
        resource = Resource.from_contents(schema)
        resources[schema["$id"]] = resource
        resources[f"{name}.schema.json"] = resource
    registry = Registry().with_resources(resources.items())
    return {
        name: Draft202012Validator(raw[name], registry=registry)
        for name in raw
    }


def normalize(value):
    """Recursively convert YAML-parsed date/datetime objects to ISO strings.

    YAML parses bare dates like `2022-12-29` into datetime.date objects;
    the schemas expect strings, and authors shouldn't have to quote dates
    in frontmatter.
    """
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: normalize(v) for k, v in value.items()}
    if isinstance(value, list):
        return [normalize(v) for v in value]
    return value


def parse_dir(directory: Path, recursive: bool = True) -> list[tuple[Path, dict, str]]:
    """Parse all .md files in a directory into (path, frontmatter, body) tuples."""
    if not directory.exists():
        return []
    pattern = "**/*.md" if recursive else "*.md"
    entries = []
    for path in sorted(directory.glob(pattern)):
        post = frontmatter.load(path)
        entries.append((path, normalize(dict(post.metadata)), post.content.strip()))
    return entries


def validate_schema(
    entries: list[tuple[Path, dict, str]],
    validator: Draft202012Validator,
    errors: list[BuildError],
) -> None:
    for path, meta, _body in entries:
        if not meta:
            errors.append(BuildError(path, "no YAML frontmatter found"))
            continue
        for err in validator.iter_errors(meta):
            loc = "/".join(str(p) for p in err.absolute_path) or "(root)"
            errors.append(BuildError(path, f"[{loc}] {err.message}"))


def cross_checks(
    nodes: list[tuple[Path, dict, str]],
    edges: list[tuple[Path, dict, str]],
    constraints: list[tuple[Path, dict, str]],
    errors: list[BuildError],
) -> None:
    node_ids: dict[str, Path] = {}
    constraint_ids: dict[str, Path] = {}
    edge_ids: dict[str, Path] = {}

    # Unique ids
    for path, meta, _ in nodes:
        nid = meta.get("id")
        if not isinstance(nid, str):
            continue  # schema error already reported
        if nid in node_ids:
            errors.append(BuildError(path, f"duplicate node id '{nid}' (also in {node_ids[nid].name})"))
        node_ids[nid] = path

    for path, meta, _ in constraints:
        cid = meta.get("id")
        if not isinstance(cid, str):
            continue
        if cid in constraint_ids:
            errors.append(BuildError(path, f"duplicate constraint id '{cid}' (also in {constraint_ids[cid].name})"))
        constraint_ids[cid] = path

    for path, meta, _ in edges:
        eid = meta.get("id")
        if not isinstance(eid, str):
            continue
        if eid in edge_ids:
            errors.append(BuildError(path, f"duplicate edge id '{eid}' (also in {edge_ids[eid].name})"))
        edge_ids[eid] = path

    # Node layer/type pairing and constraint refs
    for path, meta, _ in nodes:
        layer, ntype = meta.get("layer"), meta.get("type")
        if layer in LAYER_TYPES and ntype is not None and ntype not in LAYER_TYPES[layer]:
            errors.append(BuildError(path, f"type '{ntype}' is not valid for layer '{layer}' (allowed: {sorted(LAYER_TYPES[layer])})"))
        for cid in meta.get("constraints", []) or []:
            if cid not in constraint_ids:
                errors.append(BuildError(path, f"references unknown constraint '{cid}'"))

    # Edge endpoint and constraint refs
    for path, meta, _ in edges:
        for endpoint in ("from", "to"):
            ref = meta.get(endpoint)
            if isinstance(ref, str) and ref not in node_ids:
                errors.append(BuildError(path, f"'{endpoint}' references unknown node '{ref}'"))
        if meta.get("from") == meta.get("to") and meta.get("from") is not None:
            errors.append(BuildError(path, "self-loop: 'from' and 'to' are the same node"))
        for cid in meta.get("constraints", []) or []:
            if cid not in constraint_ids:
                errors.append(BuildError(path, f"references unknown constraint '{cid}'"))

    # Filename should match id (keeps the vault navigable)
    for path, meta, _ in [*nodes, *edges, *constraints]:
        entry_id = meta.get("id")
        if isinstance(entry_id, str) and path.stem != entry_id:
            errors.append(BuildError(path, f"filename '{path.stem}.md' does not match id '{entry_id}'"))


def emit(
    nodes: list[tuple[Path, dict, str]],
    edges: list[tuple[Path, dict, str]],
    constraints: list[tuple[Path, dict, str]],
    out_path: Path,
) -> dict:
    def pack(entries):
        packed = []
        for _path, meta, body in entries:
            item = dict(meta)
            if body:
                item["body"] = body
            packed.append(item)
        return packed

    graph = {
        "meta": {
            "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "counts": {
                "nodes": len(nodes),
                "edges": len(edges),
                "constraints": len(constraints),
            },
            "schema_version": "1.0.0",
        },
        "nodes": pack(nodes),
        "edges": pack(edges),
        "constraints": pack(constraints),
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(graph, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return graph


def main() -> int:
    ap = argparse.ArgumentParser(description="Vault -> graph.json build pipeline")
    ap.add_argument("--validate", action="store_true", help="validate only; do not write graph.json")
    ap.add_argument("--include-pending", action="store_true", help="also validate vault/_pending/ proposals")
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT, help="output path for graph.json")
    args = ap.parse_args()

    validators = load_schemas()
    errors: list[BuildError] = []

    nodes = parse_dir(VAULT / "nodes")
    edges = parse_dir(VAULT / "edges")
    constraints = parse_dir(VAULT / "constraints")

    validate_schema(nodes, validators["node"], errors)
    validate_schema(edges, validators["edge"], errors)
    validate_schema(constraints, validators["constraint"], errors)
    cross_checks(nodes, edges, constraints, errors)

    if args.include_pending:
        # Pending proposals are validated for schema correctness only.
        # They may reference canonical entries; missing refs are reported as
        # warnings, not errors, since approval order varies.
        pending = parse_dir(VAULT / "_pending")
        known_node_ids = {m.get("id") for _, m, _ in nodes} | {
            m.get("id") for _, m, _ in pending if m.get("layer")
        }
        pend_errors: list[BuildError] = []
        for path, meta, body in pending:
            if "layer" in meta:
                validate_schema([(path, meta, body)], validators["node"], pend_errors)
            elif "from" in meta:
                validate_schema([(path, meta, body)], validators["edge"], pend_errors)
                for endpoint in ("from", "to"):
                    ref = meta.get(endpoint)
                    if isinstance(ref, str) and ref not in known_node_ids:
                        print(f"  WARNING {path.name}: '{endpoint}' -> '{ref}' not yet in vault or pending")
            elif "category" in meta:
                validate_schema([(path, meta, body)], validators["constraint"], pend_errors)
            else:
                pend_errors.append(BuildError(path, "cannot infer entry kind (no layer/from/category key)"))
        if pend_errors:
            print(f"\nPENDING proposal problems ({len(pend_errors)}):")
            for e in pend_errors:
                print(e)
            errors.extend(pend_errors)
        else:
            print(f"Pending proposals OK: {len(pending)} file(s) in _pending/ pass schema validation")

    if errors:
        print(f"\nBUILD FAILED — {len(errors)} problem(s):")
        for e in errors:
            print(e)
        return 1

    print(f"Validation OK: {len(nodes)} nodes, {len(edges)} edges, {len(constraints)} constraints")

    if not args.validate:
        emit(nodes, edges, constraints, args.out)
        print(f"Wrote {args.out.relative_to(ROOT)}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
