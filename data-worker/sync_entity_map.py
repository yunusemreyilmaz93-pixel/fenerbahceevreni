#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Entity map: site matches/players ↔ FotMob (ve ileride FBref) ID'leri.

- public/data/matches.json içine providerIds + istatistik alanları yazar (eşleşenler)
- data-worker/output/entity_map.json kanonik harita
- public/data/entity-map.json (FE / API okur)

Kullanım:
  python data-worker/sync_entity_map.py
  python data-worker/run_job.py --type sync_entity_ids
"""
from __future__ import annotations

import json
import re
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

WORKER = Path(__file__).resolve().parent
REPO = WORKER.parent
MATCHES_PATH = REPO / "public" / "data" / "matches.json"
SQUAD_PATH = REPO / "public" / "data" / "squad.json"
ADV_DIR = WORKER / "output" / "advanced"
OUT_MAP = WORKER / "output" / "entity_map.json"
PUBLIC_MAP = REPO / "public" / "data" / "entity-map.json"


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def norm_name(s: str) -> str:
    if not s:
        return ""
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = s.replace("ı", "i").replace("ş", "s").replace("ğ", "g").replace("ü", "u").replace("ö", "o").replace("ç", "c")
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def team_tokens(name: str) -> set[str]:
    n = norm_name(name)
    stop = {"fk", "sk", "jk", "fc", "as", "spor", "kulubu", "the"}
    return {t for t in n.split() if t not in stop and len(t) > 2}


def teams_match(a: str, b: str) -> bool:
    na, nb = norm_name(a), norm_name(b)
    if not na or not nb:
        return False
    if na == nb or na in nb or nb in na:
        return True
    ta, tb = team_tokens(a), team_tokens(b)
    if not ta or not tb:
        return False
    return bool(ta & tb) or any(x in nb for x in ta) or any(x in na for x in tb)


def parse_score(score: str | None) -> tuple[int | None, int | None]:
    if not score:
        return None, None
    m = re.search(r"(\d+)\s*[-:]\s*(\d+)", str(score))
    if not m:
        return None, None
    return int(m.group(1)), int(m.group(2))


def parse_metric_num(v: Any) -> float | None:
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v)
    m = re.search(r"([\d.]+)", s)
    if not m:
        return None
    try:
        return float(m.group(1))
    except ValueError:
        return None


def load_fotmob_advanced() -> list[dict]:
    docs = []
    if not ADV_DIR.exists():
        return docs
    for p in ADV_DIR.glob("*.json"):
        try:
            d = json.loads(p.read_text(encoding="utf-8"))
            if d.get("provider") == "fotmob" or "fotmob" in p.name:
                # skip obvious non-FB if neither team is Fenerbahce
                h, a = d.get("homeTeam") or "", d.get("awayTeam") or ""
                if not (teams_match(h, "Fenerbahçe") or teams_match(a, "Fenerbahçe")):
                    continue
                docs.append(d)
        except Exception:
            continue
    return docs


def pick_side_metrics(adv: dict, site_home: str) -> tuple[dict, dict, bool]:
    """Return (home_metrics_for_site, away_metrics_for_site, flipped)."""
    tm = adv.get("teamMetrics") or {}
    fh, fa = tm.get("home") or {}, tm.get("away") or {}
    adv_home = adv.get("homeTeam") or ""
    # if site home is Fener and fotmob has FB as away → flip
    if teams_match(site_home, adv_home):
        return fh, fa, False
    return fa, fh, True


def metric_get(m: dict, *keys: str) -> float | None:
    for k in keys:
        if k in m:
            return parse_metric_num(m.get(k))
        # case-insensitive
        for mk, mv in m.items():
            if str(mk).lower() == k.lower():
                return parse_metric_num(mv)
    # partial
    for k in keys:
        for mk, mv in m.items():
            if k.lower() in str(mk).lower():
                return parse_metric_num(mv)
    return None


def enrich_match_from_adv(match: dict, adv: dict) -> dict:
    site_home = match.get("homeTeam") or ""
    home_m, away_m, flipped = pick_side_metrics(adv, site_home)

    sh, sa = parse_score(adv.get("score"))
    # scores on site already exist; if flipped score on fotmob, site may already be correct

    xg_h = metric_get(home_m, "expectedGoals", "Expected goals", "xG")
    xg_a = metric_get(away_m, "expectedGoals", "Expected goals", "xG")
    # sometimes only under expectedGoals key we set in parser
    if xg_h is None:
        xg_h = parse_metric_num(home_m.get("expectedGoals"))
    if xg_a is None:
        xg_a = parse_metric_num(away_m.get("expectedGoals"))

    match = dict(match)
    match["providerIds"] = {
        **(match.get("providerIds") or {}),
        "fotmob": str(adv.get("providerMatchId") or ""),
    }
    match["advancedMatchDocumentId"] = adv.get("matchDocumentId") or adv.get("id")
    match["statsProvider"] = "fotmob"
    match["statsFetchedAt"] = adv.get("fetchedAt") or utc_now()

    poss_h = metric_get(home_m, "Ball possession", "possession")
    poss_a = metric_get(away_m, "Ball possession", "possession")
    if poss_h is not None:
        match["possessionHome"] = int(poss_h)
    if poss_a is not None:
        match["possessionAway"] = int(poss_a)

    sh_h = metric_get(home_m, "Total shots", "Shots")
    sh_a = metric_get(away_m, "Total shots", "Shots")
    if sh_h is not None:
        match["shotsHome"] = int(sh_h)
    if sh_a is not None:
        match["shotsAway"] = int(sh_a)

    sot_h = metric_get(home_m, "Shots on target")
    sot_a = metric_get(away_m, "Shots on target")
    if sot_h is not None:
        match["shotsOnTargetHome"] = int(sot_h)
    if sot_a is not None:
        match["shotsOnTargetAway"] = int(sot_a)

    cor_h = metric_get(home_m, "Corners")
    cor_a = metric_get(away_m, "Corners")
    if cor_h is not None:
        match["cornersHome"] = int(cor_h)
    if cor_a is not None:
        match["cornersAway"] = int(cor_a)

    foul_h = metric_get(home_m, "Fouls committed", "Fouls")
    foul_a = metric_get(away_m, "Fouls committed", "Fouls")
    if foul_h is not None:
        match["foulsHome"] = int(foul_h)
    if foul_a is not None:
        match["foulsAway"] = int(foul_a)

    if xg_h is not None or xg_a is not None:
        match["xGHome"] = xg_h
        match["xGAway"] = xg_a
        match["xG"] = f"{xg_h if xg_h is not None else '—'} – {xg_a if xg_a is not None else '—'}"

    match["shotmapCount"] = len(adv.get("shotmap") or [])
    match["statsFlippedFromProvider"] = flipped
    return match


def find_best_adv(match: dict, adv_list: list[dict]) -> dict | None:
    """Sıkı eşleştirme: her iki takım adı da uymalı. Skor varsa bonus.

    Upcoming / skorsuz maçlara rastgele finished advanced basılmaz.
    """
    site_home = match.get("homeTeam") or ""
    site_away = match.get("awayTeam") or ""
    sh, sa = match.get("scoreHome"), match.get("scoreAway")
    status = (match.get("status") or "").lower()

    best = None
    best_score = -1
    for adv in adv_list:
        ah, aa = adv.get("homeTeam") or "", adv.get("awayTeam") or ""
        pair_ok = (
            (teams_match(site_home, ah) and teams_match(site_away, aa))
            or (teams_match(site_home, aa) and teams_match(site_away, ah))
        )
        if not pair_ok:
            continue

        score = 10
        ph, pa = parse_score(adv.get("score"))
        if sh is not None and sa is not None and ph is not None and pa is not None:
            if (int(sh) == ph and int(sa) == pa) or (int(sh) == pa and int(sa) == ph):
                score += 25
            else:
                # skor çelişiyorsa bu maç değil
                score -= 30

        # upcoming site maçına finished provider skoru yazma (skor yoksa sadece isim eşleşmesi yetersiz)
        if status in ("upcoming", "scheduled") and (sh is None and sa is None):
            score -= 20

        if score > best_score:
            best_score = score
            best = adv
    # pair_ok=10 + score match=25 → 35; finished site with pair only → allow 10 if both finished
    if best_score >= 20:
        return best
    if best is not None and best_score >= 10 and status in ("finished", "ft", "ended", ""):
        # bitmiş site maçında isim çifti yeter (skor admin/manuel farklı format olabilir)
        if sh is not None or status == "finished":
            return best
    return None


def slugify(s: str) -> str:
    n = norm_name(s).replace(" ", "-")
    return re.sub(r"-+", "-", n).strip("-") or "team"


def stub_match_from_adv(adv: dict) -> dict | None:
    """CMS maç kaydı yoksa advanced paketten bitmiş FB maçı iskeleti (sahte skor yok).

    Skoru olmayan / bitmemiş paketten stub üretilmez.
    """
    ph, pa = parse_score(adv.get("score"))
    if ph is None and pa is None:
        return None
    home = adv.get("homeTeam") or "Home"
    away = adv.get("awayTeam") or "Away"
    pid = str(adv.get("providerMatchId") or "")
    mid = f"fb-fotmob-{pid}" if pid else f"fb-adv-{slugify(home)}-{slugify(away)}"
    return {
        "id": mid,
        "homeTeam": home,
        "awayTeam": away,
        "competition": adv.get("competition") or "Trendyol Süper Lig",
        "matchDate": adv.get("matchDate") or "",
        "status": "finished",
        "scoreHome": ph,
        "scoreAway": pa,
        "featured": False,
        "source": "fotmob-advanced-stub",
        "providerIds": {"fotmob": pid},
        "createdAt": utc_now(),
        "updatedAt": utc_now(),
    }


def build_player_map() -> list[dict]:
    docs = []
    if not SQUAD_PATH.exists():
        return docs
    squad = json.loads(SQUAD_PATH.read_text(encoding="utf-8"))
    for p in squad.get("players") or []:
        slug = p.get("slug") or p.get("id")
        docs.append(
            {
                "schemaVersion": 1,
                "playerDocumentId": slug,
                "canonicalName": p.get("name"),
                "slug": slug,
                "aliases": [p.get("name"), p.get("fullName")],
                "providers": {
                    "transfermarkt": {"id": p.get("id"), "name": p.get("name")},
                    "manual": {"id": slug, "name": p.get("name")},
                },
                "mappingStatus": "review",
                "confidence": 0.5,
                "createdAt": utc_now(),
                "updatedAt": utc_now(),
            }
        )
    return docs


def main() -> int:
    if not MATCHES_PATH.exists():
        print("matches.json yok", flush=True)
        return 1

    data = json.loads(MATCHES_PATH.read_text(encoding="utf-8"))
    matches = data.get("matches") or []
    adv_list = load_fotmob_advanced()

    STAT_KEYS = (
        "possessionHome", "possessionAway", "shotsHome", "shotsAway",
        "shotsOnTargetHome", "shotsOnTargetAway", "cornersHome", "cornersAway",
        "foulsHome", "foulsAway", "xGHome", "xGAway", "xG", "shotmapCount",
        "statsProvider", "statsFetchedAt", "advancedMatchDocumentId",
        "statsFlippedFromProvider",
    )

    def strip_auto_stats(m: dict) -> dict:
        """Önceki yanlış auto-enrich temizle (manuel alanları koru)."""
        out = dict(m)
        # sadece fotmob auto map'i kaldır
        pids = dict(out.get("providerIds") or {})
        if pids.get("fotmob"):
            pids.pop("fotmob", None)
        if pids:
            out["providerIds"] = pids
        else:
            out.pop("providerIds", None)
        for k in STAT_KEYS:
            out.pop(k, None)
        return out

    mappings = []
    updated = 0
    new_matches = []
    used_adv_ids: set[str] = set()
    for m in matches:
        clean = strip_auto_stats(m)
        adv = find_best_adv(clean, adv_list)
        if adv:
            enriched = enrich_match_from_adv(clean, adv)
            new_matches.append(enriched)
            updated += 1
            aid = str(adv.get("providerMatchId") or adv.get("id") or "")
            if aid:
                used_adv_ids.add(aid)
            mappings.append(
                {
                    "siteMatchId": m.get("id"),
                    "provider": "fotmob",
                    "providerMatchId": adv.get("providerMatchId"),
                    "advancedDocId": adv.get("id") or adv.get("matchDocumentId"),
                    "homeTeam": m.get("homeTeam"),
                    "awayTeam": m.get("awayTeam"),
                    "confidence": 0.9,
                    "mappingStatus": "confirmed",
                }
            )
        else:
            new_matches.append(clean)

    # B DoD: advanced'te olup CMS'te olmayan bitmiş FB maçlarını ekle
    stubs_added = 0
    existing_ids = {str(m.get("id")) for m in new_matches}
    for adv in adv_list:
        pid = str(adv.get("providerMatchId") or "")
        aid = pid or str(adv.get("id") or "")
        if aid in used_adv_ids:
            continue
        stub = stub_match_from_adv(adv)
        if not stub:
            continue
        if stub["id"] in existing_ids:
            continue
        # avoid duplicating upcoming CMS friendlies that share opponent names
        opponent_dup = False
        for m in new_matches:
            if (m.get("status") or "").lower() in ("upcoming", "scheduled"):
                if (
                    teams_match(m.get("homeTeam") or "", stub.get("homeTeam") or "")
                    and teams_match(m.get("awayTeam") or "", stub.get("awayTeam") or "")
                ) or (
                    teams_match(m.get("homeTeam") or "", stub.get("awayTeam") or "")
                    and teams_match(m.get("awayTeam") or "", stub.get("homeTeam") or "")
                ):
                    opponent_dup = True
                    break
        if opponent_dup:
            continue
        enriched = enrich_match_from_adv(stub, adv)
        new_matches.append(enriched)
        stubs_added += 1
        updated += 1
        existing_ids.add(stub["id"])
        used_adv_ids.add(aid)
        mappings.append(
            {
                "siteMatchId": stub["id"],
                "provider": "fotmob",
                "providerMatchId": adv.get("providerMatchId"),
                "advancedDocId": adv.get("id") or adv.get("matchDocumentId"),
                "homeTeam": stub.get("homeTeam"),
                "awayTeam": stub.get("awayTeam"),
                "confidence": 0.85,
                "mappingStatus": "confirmed",
                "source": "advanced-stub",
            }
        )

    data["matches"] = new_matches
    data["updatedAt"] = utc_now()
    data["entityMapSyncedAt"] = utc_now()
    data["source"] = data.get("source") or "entity-map + fotmob advanced"
    MATCHES_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    player_maps = build_player_map()
    entity = {
        "schemaVersion": 1,
        "fetchedAt": utc_now(),
        "matchMappings": mappings,
        "playerMappingsCount": len(player_maps),
        "playerMappings": player_maps,
        "fotmobAdvancedAvailable": len(adv_list),
        "matchesEnriched": updated,
        "stubsAddedFromAdvanced": stubs_added,
    }
    OUT_MAP.parent.mkdir(parents=True, exist_ok=True)
    OUT_MAP.write_text(json.dumps(entity, ensure_ascii=False, indent=2), encoding="utf-8")
    PUBLIC_MAP.write_text(json.dumps(entity, ensure_ascii=False, indent=2), encoding="utf-8")

    # providerIds local dump for admin
    pid_path = WORKER / "output" / "providerIds_players.json"
    pid_path.write_text(json.dumps(player_maps, ensure_ascii=False, indent=2), encoding="utf-8")

    print(
        json.dumps(
            {
                "ok": True,
                "matchesEnriched": updated,
                "fotmobDocs": len(adv_list),
                "playerMaps": len(player_maps),
                "entityMap": str(PUBLIC_MAP),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
