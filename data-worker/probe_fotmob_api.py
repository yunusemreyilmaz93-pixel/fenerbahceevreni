#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import re
import urllib.request

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)


def get(url: str):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "application/json",
            "Referer": "https://www.fotmob.com/",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def main():
    team = get("https://www.fotmob.com/api/data/teams?id=9826")
    print("team keys", list(team.keys()))
    s = json.dumps(team)
    ids = re.findall(r'"id":\s*(\d{6,8})', s)
    ids2 = re.findall(r"#(\d{6,8})", s)
    uniq = list(dict.fromkeys(ids2 + ids))
    print("match id candidates", uniq[:20])

    mid = uniq[0] if uniq else None
    print("try mid", mid)
    if not mid:
        return 1
    for path in [
        f"https://www.fotmob.com/api/data/matchDetails?matchId={mid}",
        f"https://www.fotmob.com/api/matchDetails?matchId={mid}",
        f"https://www.fotmob.com/api/data/matches?id={mid}",
    ]:
        try:
            d = get(path)
            print("OK", path)
            print(" keys", list(d.keys())[:15])
            content = d.get("content") or {}
            if isinstance(content, dict):
                print(" content keys", list(content.keys())[:20])
                sm = content.get("shotmap")
                print(" shotmap type", type(sm), (list(sm.keys())[:8] if isinstance(sm, dict) else ""))
            # write sample
            with open(
                "data-worker/output/fotmob/probe_match.json",
                "w",
                encoding="utf-8",
            ) as f:
                json.dump(d, f, ensure_ascii=False, indent=2)
            print("wrote probe_match.json")
            return 0
        except Exception as e:
            print("fail", path, e)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
