#!/usr/bin/env python3
"""Fetch 2-year weekly stock history for every ticker in the vault.

Scans vault/nodes/ for `ticker.symbol` frontmatter, pulls weekly closes
from Yahoo Finance (via yfinance), and writes frontend/public/prices.json.

Market data is display-layer data, not vault content: it is fetched
mechanically, never hand-edited, and carries its provenance in `meta`.
Re-run whenever fresher prices are wanted; the file is committed so the
repo renders without network access.

Usage:
    python scripts/fetch_prices.py
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import frontmatter
import yfinance as yf

ROOT = Path(__file__).resolve().parent.parent
NODES_DIR = ROOT / "vault" / "nodes"
OUT = ROOT / "frontend" / "public" / "prices.json"

PERIOD = "2y"
INTERVAL = "1wk"


def collect_tickers() -> dict[str, str]:
    """Return {symbol: exchange_note} for every ticker in the vault."""
    tickers: dict[str, str] = {}
    for path in sorted(NODES_DIR.glob("**/*.md")):
        meta = frontmatter.load(path).metadata
        ticker = meta.get("ticker")
        if isinstance(ticker, dict) and ticker.get("symbol"):
            tickers[ticker["symbol"]] = ticker.get("exchange", "")
    return tickers


def fetch_series(symbol: str) -> dict | None:
    t = yf.Ticker(symbol)
    hist = t.history(period=PERIOD, interval=INTERVAL, auto_adjust=True)
    if hist.empty:
        print(f"  WARNING: no data returned for {symbol}", file=sys.stderr)
        return None
    closes = hist["Close"].dropna()
    points = [[idx.strftime("%Y-%m-%d"), round(float(v), 2)] for idx, v in closes.items()]
    first, last = points[0][1], points[-1][1]
    info_currency = "USD"
    try:
        info_currency = t.fast_info.get("currency") or "USD"
    except Exception:
        pass
    return {
        "currency": info_currency,
        "points": points,
        "first_close": first,
        "last_close": last,
        "change_pct": round((last - first) / first * 100, 1) if first else None,
    }


def main() -> int:
    tickers = collect_tickers()
    if not tickers:
        print("No tickers found in vault/nodes/ — nothing to fetch.")
        return 0
    print(f"Fetching {PERIOD} of {INTERVAL} closes for: {', '.join(sorted(tickers))}")

    series = {}
    for symbol in sorted(tickers):
        data = fetch_series(symbol)
        if data is not None:
            data["exchange"] = tickers[symbol]
            series[symbol] = data
            print(f"  {symbol}: {len(data['points'])} points, {data['change_pct']:+.1f}% over period")

    out = {
        "meta": {
            "fetched_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "source": "Yahoo Finance via yfinance",
            "period": PERIOD,
            "interval": INTERVAL,
            "note": "Weekly adjusted closes. Display data only — not investment advice; not part of the sourced vault content.",
        },
        "series": series,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
