# -*- coding: utf-8 -*-
import json
from datetime import datetime, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
p = REPO / "public" / "data" / "matches.json"
data = json.loads(p.read_text(encoding="utf-8"))
adv = json.loads(
    (REPO / "data-worker" / "output" / "advanced" / "fotmob-4842613__fotmob.json").read_text(
        encoding="utf-8"
    )
)
tm = adv.get("teamMetrics") or {}
H, A = tm.get("home") or {}, tm.get("away") or {}


def n(m, k):
    v = m.get(k)
    if v is None:
        return None
    try:
        return float(str(v).replace("%", "").split()[0])
    except Exception:
        return None


demo = {
    "id": "fb-eyupspor-2026-lig",
    "homeTeam": "Fenerbahçe",
    "awayTeam": "Eyüpspor",
    "homeLogo": "/logos/fenerbahce.png",
    "awayLogo": "/logos/eyupspor.png",
    "competition": "Trendyol Süper Lig",
    "matchDate": "2026-04-01T17:00:00",
    "status": "finished",
    "scoreHome": 3,
    "scoreAway": 3,
    "featured": False,
    "providerIds": {"fotmob": "4842613"},
    "advancedMatchDocumentId": "fotmob-4842613",
    "statsProvider": "fotmob",
    "statsFlippedFromProvider": False,
    "matchPreview": "FotMob advanced (xG + shotmap) bağlı demo maç kaydı — UI testi.",
    "createdAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
    "possessionHome": int(n(H, "Ball possession") or 0),
    "possessionAway": int(n(A, "Ball possession") or 0),
    "shotsHome": int(n(H, "Total shots") or 0),
    "shotsAway": int(n(A, "Total shots") or 0),
    "shotsOnTargetHome": int(n(H, "Shots on target") or 0),
    "shotsOnTargetAway": int(n(A, "Shots on target") or 0),
    "xGHome": n(H, "expectedGoals"),
    "xGAway": n(A, "expectedGoals"),
    "shotmapCount": len(adv.get("shotmap") or []),
}
demo["xG"] = f"{demo['xGHome']} – {demo['xGAway']}"

ms = [m for m in (data.get("matches") or []) if m.get("id") != demo["id"]]
ms.insert(1, demo)
data["matches"] = ms
data["updatedAt"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

# entity map append
em_path = REPO / "public" / "data" / "entity-map.json"
if em_path.exists():
    em = json.loads(em_path.read_text(encoding="utf-8"))
else:
    em = {"matchMappings": [], "schemaVersion": 1}
maps = [m for m in em.get("matchMappings") or [] if m.get("siteMatchId") != demo["id"]]
maps.append(
    {
        "siteMatchId": demo["id"],
        "provider": "fotmob",
        "providerMatchId": "4842613",
        "advancedDocId": "fotmob-4842613__fotmob",
        "homeTeam": "Fenerbahçe",
        "awayTeam": "Eyüpspor",
        "confidence": 1.0,
        "mappingStatus": "confirmed",
    }
)
em["matchMappings"] = maps
em["fetchedAt"] = data["updatedAt"]
em_path.write_text(json.dumps(em, ensure_ascii=False, indent=2), encoding="utf-8")
(REPO / "data-worker" / "output" / "entity_map.json").write_text(
    json.dumps(em, ensure_ascii=False, indent=2), encoding="utf-8"
)
print("ok", demo["id"], demo["xG"], "shots", demo["shotmapCount"])
