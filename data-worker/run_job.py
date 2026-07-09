#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Faz A3 — Job runner (CLI).

Kullanım:
  python data-worker/run_job.py --type sync_standings --season 2025
  python data-worker/run_job.py --type sync_squad --season 2026
  python data-worker/run_job.py --type health_probe

- Job log: data-worker/output/scrapeJobs/<jobId>.json
- İsteğe bağlı Firestore: FIREBASE_SERVICE_ACCOUNT_JSON env (path) set ise yazar.
- sync_* mevcut fetch script'lerini subprocess ile çağırır.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import traceback
import uuid
from datetime import datetime, timezone
from pathlib import Path

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


def try_firestore_write_job(doc: dict, job_id: str) -> bool:
    sa = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON") or os.environ.get(
        "GOOGLE_APPLICATION_CREDENTIALS"
    )
    if not sa or not Path(sa).exists():
        return False
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        if not firebase_admin._apps:
            cred = credentials.Certificate(sa)
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        db.collection(COLLECTIONS["scrape_jobs"]).document(job_id).set(doc)
        return True
    except Exception as e:
        print(f"[warn] Firestore job write failed: {e}", file=sys.stderr)
        return False


def try_firestore_upsert_collection(collection: str, docs: list[dict]) -> int:
    sa = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON") or os.environ.get(
        "GOOGLE_APPLICATION_CREDENTIALS"
    )
    if not sa or not Path(sa).exists():
        return 0
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        if not firebase_admin._apps:
            cred = credentials.Certificate(sa)
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        batch = db.batch()
        n = 0
        for d in docs:
            doc_id = d.get("id") or d.get("slug")
            if not doc_id:
                continue
            ref = db.collection(collection).document(str(doc_id))
            payload = {k: v for k, v in d.items() if k != "id"}
            payload["updatedAt"] = utc_now()
            batch.set(ref, payload, merge=True)
            n += 1
            if n % 400 == 0:
                batch.commit()
                batch = db.batch()
        if n % 400:
            batch.commit()
        return n
    except Exception as e:
        print(f"[warn] Firestore upsert {collection}: {e}", file=sys.stderr)
        return 0


def job_sync_standings(season: str) -> tuple[int, int, str]:
    code, out = run_subprocess(
        [py(), str(WORKER / "fetch_standings.py"), "--season", season]
    )
    written = 0
    path = REPO / "public" / "data" / "standings.json"
    if path.exists() and code == 0:
        data = json.loads(path.read_text(encoding="utf-8"))
        # Tek belge: season key id
        doc = {
            "id": f"super-lig-{data.get('season', season)}",
            **data,
        }
        written = try_firestore_upsert_collection("standings", [doc])
        if written == 0:
            written = 1  # local success counts as 1 record
    return code, written, out[-2000:] if out else ""


def job_sync_squad(season: str) -> tuple[int, int, str]:
    # fetch_squad --season expects full year like 2026
    code, out = run_subprocess(
        [py(), str(WORKER / "fetch_squad.py"), "--season", season]
    )
    written = 0
    path = REPO / "public" / "data" / "squad.json"
    if path.exists() and code == 0:
        data = json.loads(path.read_text(encoding="utf-8"))
        players = data.get("players") or []
        # Normalize for players collection
        docs = []
        for p in players:
            pid = p.get("id") or p.get("slug")
            docs.append({**p, "id": pid})
        n = try_firestore_upsert_collection("players", docs)
        written = n if n else len(docs)
    return code, written, out[-2000:] if out else ""


def job_health_probe() -> tuple[int, int, str]:
    checks = []
    for name, path in [
        ("squad.json", REPO / "public" / "data" / "squad.json"),
        ("standings.json", REPO / "public" / "data" / "standings.json"),
        ("matches.json", REPO / "public" / "data" / "matches.json"),
    ]:
        ok = path.exists()
        checks.append({"file": name, "ok": ok, "bytes": path.stat().st_size if ok else 0})
    # Provider module import smoke
    providers_ok = True
    try:
        import contracts as c

        assert "sync_squad" in c.JOB_TYPES
    except Exception:
        providers_ok = False
    code = 0 if providers_ok and all(c["ok"] for c in checks[:2]) else 1
    return code, len(checks), json.dumps({"checks": checks, "contracts": providers_ok}, ensure_ascii=False)


def job_sync_player_season_stats(season: str) -> tuple[int, int, str]:
    """FBref Super Lig player season stats; fallback FotMob league xG table."""
    # season may be "2025" from CLI default — normalize to 2025-26
    if re_full_season := __import__("re").match(r"^(\d{4})$", str(season)):
        y = int(re_full_season.group(1))
        season = f"{y}-{str(y + 1)[-2:]}"
    code, out = run_subprocess(
        [py(), str(WORKER / "fetch_fbref_stats.py"), "--season", str(season)]
    )
    written = 0
    if code == 0:
        adv = WORKER / "output" / "fbref" / f"advanced_players_{season}.json"
        if adv.exists():
            docs = json.loads(adv.read_text(encoding="utf-8"))
            written = try_firestore_upsert_collection("advancedPlayerStats", docs) or len(docs)
        else:
            written = 1
        return code, written, out[-2000:] if out else ""

    # Fallback: FotMob Super Lig xG table (Chrome gerektirmez)
    try:
        sys.path.insert(0, str(WORKER))
        from providers.fotmob import export_league_xg_table

        xg = export_league_xg_table(71)
        teams = xg.get("teams") or []
        written = len(teams) or (1 if xg.get("fenerbahce") else 0)
        summary = f"FBref failed; FotMob xG table ok teams={written} fb={xg.get('fenerbahce')}"
        # partial success
        return 0, written, summary + " | " + (out[-500:] if out else "")
    except Exception as e:
        return code, 0, (out[-1500:] if out else "") + f" | fotmob xg fallback: {e}"


def job_sync_match_advanced(season: str) -> tuple[int, int, str]:
    """FotMob last matches xG/shotmap (provider override via env FOTMOB_TEAM_ID)."""
    team_id = os.environ.get("FOTMOB_TEAM_ID", "8695")  # Fenerbahçe FotMob id
    limit = os.environ.get("FOTMOB_MATCH_LIMIT", "5")
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
    written = 0
    if code == 0:
        summary_path = WORKER / "output" / "fotmob" / "last_run_summary.json"
        if summary_path.exists():
            summary = json.loads(summary_path.read_text(encoding="utf-8"))
            matches = summary.get("matches") or []
            n = try_firestore_upsert_collection("advancedMatchStats", matches)
            written = n if n else len(matches)
        else:
            written = 1
    return code, written, out[-2000:] if out else ""


def main() -> int:
    ap = argparse.ArgumentParser(description="FB Evreni scrape job runner")
    ap.add_argument("--type", required=True, choices=JOB_TYPES, dest="job_type")
    ap.add_argument("--season", default="2025", help="Sezon anahtarı (job'a göre)")
    ap.add_argument("--provider", default=None)
    ap.add_argument("--trigger", default="cli", choices=["admin", "scheduler", "cli", "api"])
    args = ap.parse_args()

    provider_map = {
        "sync_squad": "transfermarkt",
        "sync_standings": "transfermarkt",
        "sync_fixtures": "sofascore",
        "sync_player_season_stats": "fbref",
        "sync_match_advanced": "fotmob",
        "sync_entity_ids": "manual",
        "health_probe": "manual",
    }
    provider = args.provider or provider_map.get(args.job_type, "manual")
    if provider not in PROVIDERS:
        print(f"Geçersiz provider: {provider}", file=sys.stderr)
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

    job_path = OUT_JOBS / f"{job_id}.json"
    atomic_write_json(job_path, doc)
    print(f"[job] {job_id} running ({args.job_type})...")

    code, written, summary = 1, 0, ""
    try:
        if args.job_type == "sync_standings":
            code, written, summary = job_sync_standings(args.season)
        elif args.job_type == "sync_squad":
            # Transfermarkt saison_id for 2026-27 roster is often 2026
            code, written, summary = job_sync_squad(args.season)
        elif args.job_type == "health_probe":
            code, written, summary = job_health_probe()
        elif args.job_type == "sync_player_season_stats":
            code, written, summary = job_sync_player_season_stats(args.season)
        elif args.job_type == "sync_match_advanced":
            code, written, summary = job_sync_match_advanced(args.season)
        elif args.job_type == "sync_entity_ids":
            code, out = run_subprocess([py(), str(WORKER / "sync_entity_map.py")])
            written = 0
            if code == 0:
                em = WORKER / "output" / "entity_map.json"
                if em.exists():
                    try:
                        written = int(json.loads(em.read_text(encoding="utf-8")).get("matchesEnriched") or 0)
                    except Exception:
                        written = 1
                else:
                    written = 1
            summary = out[-2000:] if out else ""
        else:
            code, written, summary = (
                1,
                0,
                f"Job tipi henüz implement edilmedi: {args.job_type} (sonraki sprint)",
            )
    except Exception as e:
        code = 1
        summary = f"{e}"
        traceback.print_exc()

    finished = utc_now()
    doc["finishedAt"] = finished
    doc["updatedAt"] = finished
    doc["processedCount"] = max(written, 1)
    doc["successCount"] = written if code == 0 else 0
    doc["failedCount"] = 0 if code == 0 else 1
    doc["recordsWritten"] = written if code == 0 else 0
    doc["status"] = "success" if code == 0 else "failed"
    # No secrets / stack in errorSummary
    if code != 0:
        clean = summary.replace("\\", "/").split("\n")[-1][:300]
        doc["errorSummary"] = clean or f"exit {code}"
    else:
        doc["errorSummary"] = None
        doc["meta"] = {"note": summary[:500] if isinstance(summary, str) else ""}

    atomic_write_json(job_path, doc)
    fs_ok = try_firestore_write_job(doc, job_id)
    print(f"[job] status={doc['status']} recordsWritten={doc['recordsWritten']} firestore={fs_ok}")
    print(f"[job] log={job_path}")
    return 0 if code == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
