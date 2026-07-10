#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Faz A3/A4 — Job runner (CLI).

Kullanım:
  python data-worker/run_job.py --type sync_standings --season 2025
  python data-worker/run_job.py --type sync_squad --season 2026
  python data-worker/run_job.py --type health_probe
  python data-worker/run_job.py --type health_probe --require-firestore

- Job log: data-worker/output/scrapeJobs/<jobId>.json
- Firestore (A4): FIREBASE_SERVICE_ACCOUNT_JSON | GOOGLE_APPLICATION_CREDENTIALS
  | FIREBASE_SERVICE_ACCOUNT_JSON_B64
- --require-firestore: credentials yoksa veya write fail ise exit 1
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import traceback
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

WORKER = Path(__file__).resolve().parent
REPO = WORKER.parent
sys.path.insert(0, str(WORKER))

from io_utils import atomic_write_json

from contracts import (  # noqa: E402
    COLLECTIONS,
    JOB_TYPES,
    PROVIDERS,
    new_scrape_job,
)
from firestore_io import (  # noqa: E402
    UpsertResult,
    credentials_available,
    firestore_status_probe,
    upsert_collection,
    write_scrape_job,
)

OUT_JOBS = WORKER / "output" / "scrapeJobs"
OUT_JOBS.mkdir(parents=True, exist_ok=True)


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def py() -> str:
    return sys.executable


def run_subprocess(args: list[str]) -> tuple[int, str]:
    try:
        p = subprocess.run(
            args,
            cwd=str(REPO),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=600,
        )
        out = (p.stdout or "") + ("\n" + p.stderr if p.stderr else "")
        return p.returncode, out.strip()
    except subprocess.TimeoutExpired:
        return 124, "Job timeout (600s)"
    except Exception as e:
        return 1, str(e)


def fs_meta(result: UpsertResult) -> dict[str, Any]:
    return {
        "firestoreStatus": result.status,
        "firestoreRecordsWritten": result.firestore_count,
        "localRecords": result.local_count,
        "firestoreError": result.error,
        **(result.details or {}),
    }


def records_for_job(result: UpsertResult, *, code: int) -> int:
    """
    recordsWritten semantics (A4):
    - Firestore written → firestore_count (source of truth path)
    - No credentials → local_count still counts pipeline success (local JSON)
    - Firestore failed → 0 on hard fail path; runner sets failed if require-firestore
    """
    if code != 0:
        return 0
    if result.status == "written":
        return result.firestore_count
    if result.status == "failed":
        return 0
    return result.local_count


def _upsert_standings_from_path(path: Path, season: str) -> tuple[int, UpsertResult]:
    data = json.loads(path.read_text(encoding="utf-8"))
    doc = {
        "id": f"super-lig-{data.get('season', season)}",
        **data,
        "provider": data.get("source") or "transfermarkt",
        "fetchedAt": data.get("updatedAt") or utc_now(),
    }
    result = upsert_collection(COLLECTIONS["standings"], [doc])
    return records_for_job(result, code=0), result


def _upsert_squad_from_path(path: Path) -> tuple[int, UpsertResult]:
    data = json.loads(path.read_text(encoding="utf-8"))
    players = data.get("players") or []
    docs = []
    fetched = data.get("updatedAt") or data.get("scrapedAt") or utc_now()
    for p in players:
        pid = p.get("id") or p.get("slug")
        if not pid:
            continue
        docs.append(
            {
                **p,
                "id": pid,
                "provider": data.get("source") or "transfermarkt",
                "fetchedAt": p.get("fetchedAt") or fetched,
            }
        )
    result = upsert_collection(COLLECTIONS["players"], docs)
    return records_for_job(result, code=0), result


def _season_start_year(season: str) -> str:
    """'2025' | '2025-26' → '2025' for API-Football / Transfermarkt saison_id."""
    s = str(season).strip()
    m = re.match(r"^(\d{4})", s)
    return m.group(1) if m else s


def _api_football_key_present() -> bool:
    for k in ("APISPORTS_KEY", "API_FOOTBALL_KEY", "API_SPORTS_KEY"):
        if (os.environ.get(k) or "").strip():
            return True
    return False


def _api_football_season_year(requested: str) -> str:
    """
    Free plan typically only allows 2022–2024.
    API_FOOTBALL_SEASON env wins; else clamp high seasons down to 2024 for free.
    Set API_FOOTBALL_ALLOW_CURRENT=1 to pass through requested year (paid plans).
    """
    year = _season_start_year(requested)
    env_s = (os.environ.get("API_FOOTBALL_SEASON") or "").strip()
    if env_s.isdigit():
        return env_s
    allow = (os.environ.get("API_FOOTBALL_ALLOW_CURRENT") or "").strip().lower() in (
        "1",
        "true",
        "yes",
    )
    if allow:
        return year
    try:
        y = int(year)
        # Free plan ceiling (observed 2026-07): max season start year 2024
        if y > 2024:
            return "2024"
    except ValueError:
        return "2024"
    return year


def job_sync_standings(season: str) -> tuple[int, int, str, dict[str, Any]]:
    """
    Transfermarkt live scrape → Firestore.
    On 403/fail: cached public/data/standings.json (partial).
    API-Football free is NOT used here (only seasons ≤2024 — not current product data).
    """
    meta: dict[str, Any] = {}
    written = 0
    path = REPO / "public" / "data" / "standings.json"
    year = _season_start_year(season)
    code, out = run_subprocess(
        [py(), str(WORKER / "fetch_standings.py"), "--season", year]
    )
    summary = out[-2000:] if out else ""

    if path.exists() and code == 0:
        written, result = _upsert_standings_from_path(path, year)
        meta = fs_meta(result)
        meta["providerUsed"] = "transfermarkt"
        return code, written, summary, meta

    if path.exists() and path.stat().st_size > 50:
        written, result = _upsert_standings_from_path(path, year)
        meta = fs_meta(result)
        meta["usedCachedSnapshot"] = True
        meta["scrapeExit"] = code
        meta["jobOutcome"] = "partial"
        note = f"scrape failed; upserted cached standings.json ({path.stat().st_size}B)"
        summary = (summary + " | " + note).strip(" |")
        if result.status == "written" or result.local_count > 0:
            return 0, written, summary, meta
    return code, written, summary, meta


def job_sync_fixtures(season: str) -> tuple[int, int, str, dict[str, Any]]:
    """
    Disabled for free API-Football: product needs current season; free max ≈ 2024.
    Paid plan later: re-enable via fetch_api_football + API_FOOTBALL_ALLOW_CURRENT=1.
    """
    return (
        1,
        0,
        "sync_fixtures disabled: API-Football free plan has no current season "
        f"(requested {season}). Use Transfermarkt/FotMob for current data; "
        "or paid API + API_FOOTBALL_ALLOW_CURRENT=1.",
        {
            "providerUsed": None,
            "disabled": True,
            "reason": "free_plan_no_current_season",
        },
    )


def job_sync_squad(season: str) -> tuple[int, int, str, dict[str, Any]]:
    code, out = run_subprocess(
        [py(), str(WORKER / "fetch_squad.py"), "--season", season]
    )
    meta: dict[str, Any] = {}
    written = 0
    path = REPO / "public" / "data" / "squad.json"
    summary = out[-2000:] if out else ""

    if path.exists() and code == 0:
        written, result = _upsert_squad_from_path(path)
        meta = fs_meta(result)
        return code, written, summary, meta

    if path.exists() and path.stat().st_size > 50:
        written, result = _upsert_squad_from_path(path)
        meta = fs_meta(result)
        meta["usedCachedSnapshot"] = True
        meta["scrapeExit"] = code
        meta["jobOutcome"] = "partial"
        note = f"scrape failed; upserted cached squad.json ({path.stat().st_size}B)"
        summary = (summary + " | " + note).strip(" |")
        if result.status == "written" or result.local_count > 0:
            return 0, written, summary, meta
    return code, written, summary, meta


def job_health_probe() -> tuple[int, int, str, dict[str, Any]]:
    checks = []
    for name, path in [
        ("squad.json", REPO / "public" / "data" / "squad.json"),
        ("standings.json", REPO / "public" / "data" / "standings.json"),
        ("matches.json", REPO / "public" / "data" / "matches.json"),
    ]:
        ok = path.exists()
        checks.append({"file": name, "ok": ok, "bytes": path.stat().st_size if ok else 0})
    providers_ok = True
    try:
        import contracts as c

        assert "sync_squad" in c.JOB_TYPES
    except Exception:
        providers_ok = False

    fs_probe = firestore_status_probe()
    payload = {
        "checks": checks,
        "contracts": providers_ok,
        "firestore": fs_probe,
    }
    # Local files + contracts must pass; Firestore optional unless --require-firestore
    code = 0 if providers_ok and all(c["ok"] for c in checks[:2]) else 1
    meta = {
        "firestoreStatus": (
            "written"
            if fs_probe.get("clientReady")
            else (
                "skipped_no_credentials"
                if not fs_probe.get("credentialsResolved")
                else "failed"
            )
        ),
        "firestoreRecordsWritten": 0,
        "localRecords": len(checks),
        **{f"probe_{k}": v for k, v in fs_probe.items()},
    }
    return code, len(checks), json.dumps(payload, ensure_ascii=False), meta


def job_sync_player_season_stats(season: str) -> tuple[int, int, str, dict[str, Any]]:
    """FBref Super Lig player season stats; fallback FotMob league xG table."""
    if m := re.match(r"^(\d{4})$", str(season)):
        y = int(m.group(1))
        season = f"{y}-{str(y + 1)[-2:]}"
    code, out = run_subprocess(
        [py(), str(WORKER / "fetch_fbref_stats.py"), "--season", str(season)]
    )
    meta: dict[str, Any] = {}
    if code == 0:
        adv = WORKER / "output" / "fbref" / f"advanced_players_{season}.json"
        if adv.exists():
            docs = json.loads(adv.read_text(encoding="utf-8"))
            if isinstance(docs, dict):
                docs = docs.get("players") or docs.get("docs") or []
            result = upsert_collection(
                COLLECTIONS["advanced_player_stats"],
                docs if isinstance(docs, list) else [],
                respect_locked_fields=True,
            )
            meta = fs_meta(result)
            written = records_for_job(result, code=0)
        else:
            written = 1
            meta = {"firestoreStatus": "skipped_no_file", "localRecords": 1}
        return code, written, out[-2000:] if out else "", meta

    # Fallback: FotMob Super Lig xG table (Chrome gerektirmez) — local only table
    try:
        from providers.fotmob import export_league_xg_table

        xg = export_league_xg_table(71)
        teams = xg.get("teams") or []
        written = len(teams) or (1 if xg.get("fenerbahce") else 0)
        summary = f"FBref failed; FotMob xG table ok teams={written} fb={xg.get('fenerbahce')}"
        meta = {
            "firestoreStatus": "skipped_fallback_local_only",
            "localRecords": written,
            "firestoreRecordsWritten": 0,
            "note": "FotMob xG table is league aggregate; not advancedPlayerStats docs",
        }
        return 0, written, summary + " | " + (out[-500:] if out else ""), meta
    except Exception as e:
        return code, 0, (out[-1500:] if out else "") + f" | fotmob xg fallback: {e}", meta


def _is_fenerbahce_adv(d: dict[str, Any]) -> bool:
    blob = f"{d.get('homeTeam') or ''} {d.get('awayTeam') or ''}".lower()
    return "fenerbah" in blob


def job_sync_match_advanced(season: str) -> tuple[int, int, str, dict[str, Any]]:
    """FotMob last matches xG/shotmap — B DoD default limit 10."""
    team_id = os.environ.get("FOTMOB_TEAM_ID", "8695")
    limit = os.environ.get("FOTMOB_MATCH_LIMIT", "10")
    code, out = run_subprocess(
        [
            py(),
            str(WORKER / "fetch_fotmob_match.py"),
            "--team-id",
            str(team_id),
            "--limit",
            str(limit),
        ]
    )
    meta: dict[str, Any] = {}
    written = 0
    if code == 0:
        # Prefer full advanced files under output/advanced/ (FB only)
        adv_dir = WORKER / "output" / "advanced"
        docs: list[dict[str, Any]] = []
        if adv_dir.is_dir():
            for p in sorted(adv_dir.glob("*__fotmob.json")):
                try:
                    d = json.loads(p.read_text(encoding="utf-8"))
                    if not isinstance(d, dict):
                        continue
                    if not _is_fenerbahce_adv(d):
                        continue
                    if not d.get("id") and d.get("matchDocumentId"):
                        d["id"] = f"{d['matchDocumentId']}__{d.get('provider') or 'fotmob'}"
                    if not d.get("fetchedAt"):
                        d["fetchedAt"] = utc_now()
                    if not d.get("provider"):
                        d["provider"] = "fotmob"
                    docs.append(d)
                except Exception:
                    continue
        if not docs:
            summary_path = WORKER / "output" / "fotmob" / "last_run_summary.json"
            if summary_path.exists():
                summary = json.loads(summary_path.read_text(encoding="utf-8"))
                matches = summary.get("matches") or []
                for m in matches:
                    if isinstance(m, dict) and _is_fenerbahce_adv(m):
                        if not m.get("id") and m.get("matchDocumentId"):
                            m["id"] = f"{m['matchDocumentId']}__{m.get('provider') or 'fotmob'}"
                        docs.append(m)
        result = upsert_collection(
            COLLECTIONS["advanced_match_stats"],
            docs,
            respect_locked_fields=True,
        )
        meta = fs_meta(result)
        # Attach coverage if present
        cov_path = WORKER / "output" / "fotmob" / "coverage_b_dod.json"
        if cov_path.exists():
            try:
                meta["coverage"] = json.loads(cov_path.read_text(encoding="utf-8"))
            except Exception:
                pass
        meta["fbAdvancedDocs"] = len(docs)
        written = records_for_job(result, code=0)
        # B DoD soft fail only if zero packs
        if len(docs) == 0:
            code = 1
            out = (out or "") + " | no Fenerbahçe advanced packs"
    return code, written, out[-2000:] if out else "", meta


def job_sync_entity_ids() -> tuple[int, int, str, dict[str, Any]]:
    code, out = run_subprocess([py(), str(WORKER / "sync_entity_map.py")])
    meta: dict[str, Any] = {}
    written = 0
    if code == 0:
        em = WORKER / "output" / "entity_map.json"
        docs: list[dict[str, Any]] = []
        if em.exists():
            data = json.loads(em.read_text(encoding="utf-8"))
            players = data.get("playerMappings") or []
            for p in players:
                if not isinstance(p, dict):
                    continue
                pid = p.get("playerDocumentId") or p.get("id") or p.get("slug")
                if not pid:
                    continue
                docs.append({**p, "id": pid, "fetchedAt": data.get("fetchedAt") or utc_now()})
            if not docs and isinstance(data.get("providerIds"), list):
                for p in data["providerIds"]:
                    if isinstance(p, dict) and (p.get("id") or p.get("playerDocumentId")):
                        pid = p.get("id") or p.get("playerDocumentId")
                        docs.append({**p, "id": pid})
            meta["matchesEnriched"] = data.get("matchesEnriched")
            meta["stubsAddedFromAdvanced"] = data.get("stubsAddedFromAdvanced")
            meta["fotmobAdvancedAvailable"] = data.get("fotmobAdvancedAvailable")
        result = upsert_collection(
            COLLECTIONS["provider_ids"],
            docs,
            respect_locked_fields=True,
        )
        meta.update(fs_meta(result))
        # Also push enriched CMS matches (source of truth for Maç Merkezi on Firebase path)
        matches_path = REPO / "public" / "data" / "matches.json"
        match_docs: list[dict[str, Any]] = []
        if matches_path.exists():
            try:
                mj = json.loads(matches_path.read_text(encoding="utf-8"))
                for m in mj.get("matches") or []:
                    if isinstance(m, dict) and m.get("id"):
                        match_docs.append(dict(m))
            except Exception:
                pass
        if match_docs:
            mr = upsert_collection(COLLECTIONS["matches"], match_docs, respect_locked_fields=True)
            meta["matchesFirestoreStatus"] = mr.status
            meta["matchesFirestoreWritten"] = mr.firestore_count
        written = records_for_job(result, code=0)
        if written == 0 and match_docs:
            written = len(match_docs)
    return code, written, out[-2000:] if out else "", meta


def main() -> int:
    ap = argparse.ArgumentParser(description="FB Evreni scrape job runner")
    ap.add_argument("--type", required=True, choices=JOB_TYPES, dest="job_type")
    ap.add_argument("--season", default="2025", help="Sezon anahtarı (job'a göre)")
    ap.add_argument("--provider", default=None)
    ap.add_argument("--trigger", default="cli", choices=["admin", "scheduler", "cli", "api"])
    ap.add_argument(
        "--require-firestore",
        action="store_true",
        help="Service account yoksa veya Firestore write fail ise job failed",
    )
    args = ap.parse_args()

    provider_map = {
        "sync_squad": "transfermarkt",
        "sync_standings": "transfermarkt",
        "sync_fixtures": "api_football",
        "sync_player_season_stats": "fbref",
        "sync_match_advanced": "fotmob",
        "sync_entity_ids": "manual",
        "health_probe": "manual",
    }
    provider = args.provider or provider_map.get(args.job_type, "manual")
    if provider not in PROVIDERS:
        print(f"Geçersiz provider: {provider}", file=sys.stderr)
        return 2

    if args.require_firestore and not credentials_available():
        print(
            "[job] --require-firestore: credentials missing "
            "(set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS)",
            file=sys.stderr,
        )
        return 2

    job_id = f"{args.job_type}_{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S')}_{uuid.uuid4().hex[:6]}"
    doc = new_scrape_job(
        job_type=args.job_type,
        provider=provider,
        season_key=str(args.season),
        triggered_by=args.trigger,
    )
    now = utc_now()
    doc["createdAt"] = now
    doc["updatedAt"] = now
    doc["status"] = "running"
    doc["startedAt"] = now
    doc["id"] = job_id

    job_path = OUT_JOBS / f"{job_id}.json"
    atomic_write_json(job_path, doc)
    # Best-effort running status to Firestore
    write_scrape_job(COLLECTIONS["scrape_jobs"], job_id, doc)
    print(f"[job] {job_id} running ({args.job_type})...")
    if credentials_available():
        print("[job] Firestore credentials: resolved")
    else:
        print("[job] Firestore credentials: missing (local JSON only)")

    code, written, summary = 1, 0, ""
    job_meta: dict[str, Any] = {}
    try:
        if args.job_type == "sync_standings":
            code, written, summary, job_meta = job_sync_standings(args.season)
        elif args.job_type == "sync_squad":
            code, written, summary, job_meta = job_sync_squad(args.season)
        elif args.job_type == "sync_fixtures":
            code, written, summary, job_meta = job_sync_fixtures(args.season)
        elif args.job_type == "health_probe":
            code, written, summary, job_meta = job_health_probe()
        elif args.job_type == "sync_player_season_stats":
            code, written, summary, job_meta = job_sync_player_season_stats(args.season)
        elif args.job_type == "sync_match_advanced":
            code, written, summary, job_meta = job_sync_match_advanced(args.season)
        elif args.job_type == "sync_entity_ids":
            code, written, summary, job_meta = job_sync_entity_ids()
        else:
            code, written, summary, job_meta = (
                1,
                0,
                f"Job tipi henüz implement edilmedi: {args.job_type} (sonraki sprint)",
                {},
            )
    except Exception as e:
        code = 1
        summary = f"{e}"
        traceback.print_exc()

    # A4: optional hard fail when Firestore was required but not written
    fs_status = (job_meta or {}).get("firestoreStatus")
    if args.require_firestore and code == 0:
        if args.job_type == "health_probe":
            if not (job_meta or {}).get("probe_clientReady"):
                code = 1
                summary = (summary or "") + " | require-firestore: client not ready"
        elif fs_status != "written":
            # partial cache upsert must still hit Firestore when required
            code = 1
            summary = (summary or "") + f" | require-firestore: status={fs_status}"

    finished = utc_now()
    doc["finishedAt"] = finished
    doc["updatedAt"] = finished
    doc["processedCount"] = max(written, 1)
    doc["successCount"] = written if code == 0 else 0
    doc["failedCount"] = 0 if code == 0 else 1
    doc["recordsWritten"] = written if code == 0 else 0
    # partial = scrape failed but cached snapshot upserted
    if code == 0 and (job_meta or {}).get("jobOutcome") == "partial":
        doc["status"] = "partial"
    elif code == 0:
        doc["status"] = "success"
    else:
        doc["status"] = "failed"
    if code != 0:
        clean = summary.replace("\\", "/").split("\n")[-1][:300]
        doc["errorSummary"] = clean or f"exit {code}"
    elif doc["status"] == "partial":
        clean = summary.replace("\\", "/").split("\n")[-1][:300] if summary else None
        doc["errorSummary"] = clean  # scrape error kept for ops visibility
    else:
        doc["errorSummary"] = None

    # Meta: no secrets / paths with private keys
    safe_meta = {
        "note": summary[:500] if isinstance(summary, str) else "",
        **{k: v for k, v in (job_meta or {}).items() if k not in ("credPath",)},
    }
    doc["meta"] = safe_meta

    atomic_write_json(job_path, doc)
    fs_ok = write_scrape_job(COLLECTIONS["scrape_jobs"], job_id, doc)
    print(
        f"[job] status={doc['status']} recordsWritten={doc['recordsWritten']} "
        f"firestoreJobLog={fs_ok} firestoreData={fs_status or 'n/a'}"
    )
    print(f"[job] log={job_path}")
    return 0 if code == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
