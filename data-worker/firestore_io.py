"""
A4 — Firestore write path for data-worker jobs.

Credentials (server/worker only — never client / VITE_):
  1. FIREBASE_SERVICE_ACCOUNT_JSON  — path to .json OR raw JSON string (starts with '{')
  2. GOOGLE_APPLICATION_CREDENTIALS — path to service account JSON
  3. FIREBASE_SERVICE_ACCOUNT_JSON_B64 — base64-encoded service account JSON (CI)

Rules:
  - No credentials → skipped (local JSON still OK unless --require-firestore)
  - lockedFields on existing docs: job must not overwrite those top-level keys
  - Never log private_key / secrets
"""
from __future__ import annotations

import base64
import json
import os
import tempfile
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ── Pure helpers (unit-tested without firebase_admin) ───────────────────────


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def resolve_service_account_path(
    env: dict[str, str] | None = None,
) -> tuple[str | None, str]:
    """
    Resolve a filesystem path to a service account JSON file.
    Returns (path_or_None, reason_code).

    reason_code:
      ok | missing | path_not_found | invalid_inline_json | b64_decode_error
    """
    e = env if env is not None else {k: str(v) for k, v in os.environ.items()}

    b64 = (e.get("FIREBASE_SERVICE_ACCOUNT_JSON_B64") or "").strip()
    if b64:
        try:
            raw = base64.b64decode(b64)
            # Validate JSON
            json.loads(raw.decode("utf-8"))
            fd, tmp = tempfile.mkstemp(prefix="fb-sa-", suffix=".json")
            with os.fdopen(fd, "wb") as f:
                f.write(raw)
            return tmp, "ok"
        except Exception:
            return None, "b64_decode_error"

    sa = (e.get("FIREBASE_SERVICE_ACCOUNT_JSON") or "").strip()
    if sa:
        if sa.startswith("{"):
            try:
                parsed = json.loads(sa)
                if not isinstance(parsed, dict) or "project_id" not in parsed:
                    return None, "invalid_inline_json"
                fd, tmp = tempfile.mkstemp(prefix="fb-sa-", suffix=".json")
                with os.fdopen(fd, "w", encoding="utf-8") as f:
                    json.dump(parsed, f)
                return tmp, "ok"
            except Exception:
                return None, "invalid_inline_json"
        p = Path(sa)
        if p.is_file():
            return str(p.resolve()), "ok"
        return None, "path_not_found"

    gac = (e.get("GOOGLE_APPLICATION_CREDENTIALS") or "").strip()
    if gac:
        p = Path(gac)
        if p.is_file():
            return str(p.resolve()), "ok"
        return None, "path_not_found"

    return None, "missing"


def apply_locked_fields(
    existing: dict[str, Any] | None,
    incoming: dict[str, Any],
) -> dict[str, Any]:
    """
    Merge incoming into existing while preserving lockedFields values.
    lockedFields is always taken from the existing document (admin authority).
    """
    if not existing:
        out = dict(incoming)
        # Do not invent lockedFields from job payload alone in a way that locks empty
        return out

    locked = existing.get("lockedFields")
    if not isinstance(locked, list):
        locked = []
    locked_set = {str(x) for x in locked if x}

    out = dict(existing)
    for k, v in incoming.items():
        if k in locked_set:
            continue
        if k == "lockedFields":
            # Admin-owned list — jobs never replace it
            continue
        out[k] = v
    # Preserve lockedFields list
    if locked_set:
        out["lockedFields"] = list(locked)
    return out


def doc_id_from_payload(d: dict[str, Any], id_keys: tuple[str, ...] = ("id", "slug")) -> str | None:
    for k in id_keys:
        v = d.get(k)
        if v is not None and str(v).strip():
            return str(v).strip()
    return None


# ── Runtime client ──────────────────────────────────────────────────────────

_app_initialized = False
_last_cred_path: str | None = None
_last_init_error: str | None = None


@dataclass
class UpsertResult:
    local_count: int = 0
    firestore_count: int = 0
    status: str = "skipped_no_credentials"  # written | skipped_no_credentials | failed | empty
    error: str | None = None
    details: dict[str, Any] = field(default_factory=dict)


def credentials_available() -> bool:
    path, reason = resolve_service_account_path()
    return bool(path) and reason == "ok"


def get_firestore_client():
    """
    Return firebase_admin firestore client or None.
    Initializes app once. Never prints secrets.
    """
    global _app_initialized, _last_cred_path, _last_init_error

    path, reason = resolve_service_account_path()
    if not path or reason != "ok":
        _last_init_error = reason
        return None

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        if not firebase_admin._apps:
            cred = credentials.Certificate(path)
            firebase_admin.initialize_app(cred)
            _app_initialized = True
            _last_cred_path = path
            _last_init_error = None
        return firestore.client()
    except Exception as e:
        _last_init_error = type(e).__name__
        print(f"[firestore_io] init failed: {type(e).__name__}: {e}", flush=True)
        return None


def firestore_status_probe() -> dict[str, Any]:
    path, reason = resolve_service_account_path()
    return {
        "credentialsReason": reason,
        "credentialsResolved": bool(path) and reason == "ok",
        "clientReady": get_firestore_client() is not None if (path and reason == "ok") else False,
        "lastInitError": _last_init_error,
        # path basename only — never full secrets path in job meta if sensitive
        "credFileBasename": Path(path).name if path else None,
    }


def write_scrape_job(collection: str, job_id: str, doc: dict[str, Any]) -> bool:
    db = get_firestore_client()
    if not db:
        return False
    try:
        payload = {k: v for k, v in doc.items() if k != "id"}
        db.collection(collection).document(job_id).set(payload, merge=True)
        return True
    except Exception as e:
        print(f"[firestore_io] write scrapeJobs failed: {type(e).__name__}: {e}", flush=True)
        return False


def upsert_collection(
    collection: str,
    docs: list[dict[str, Any]],
    *,
    id_keys: tuple[str, ...] = ("id", "slug"),
    respect_locked_fields: bool = True,
    batch_size: int = 400,
) -> UpsertResult:
    """
    Upsert documents. local_count = valid docs with ids.
    firestore_count = successfully written when client available.
    """
    prepared: list[tuple[str, dict[str, Any]]] = []
    for d in docs:
        if not isinstance(d, dict):
            continue
        doc_id = doc_id_from_payload(d, id_keys)
        if not doc_id:
            continue
        payload = {k: v for k, v in d.items() if k != "id"}
        payload["updatedAt"] = utc_now()
        if "fetchedAt" not in payload and d.get("fetchedAt"):
            payload["fetchedAt"] = d["fetchedAt"]
        prepared.append((doc_id, payload))

    result = UpsertResult(local_count=len(prepared), status="empty" if not prepared else "skipped_no_credentials")
    if not prepared:
        return result

    db = get_firestore_client()
    if not db:
        path, reason = resolve_service_account_path()
        result.status = "skipped_no_credentials"
        result.error = reason
        result.details["credentialsReason"] = reason
        return result

    try:
        written = 0
        batch = db.batch()
        pending = 0
        for doc_id, payload in prepared:
            ref = db.collection(collection).document(doc_id)
            if respect_locked_fields:
                try:
                    snap = ref.get()
                    existing = snap.to_dict() if snap.exists else None
                except Exception:
                    existing = None
                payload = apply_locked_fields(existing, payload)
            batch.set(ref, payload, merge=True)
            pending += 1
            written += 1
            if pending >= batch_size:
                batch.commit()
                batch = db.batch()
                pending = 0
        if pending:
            batch.commit()
        result.firestore_count = written
        result.status = "written"
        return result
    except Exception as e:
        result.status = "failed"
        result.error = f"{type(e).__name__}: {e}"
        print(f"[firestore_io] upsert {collection} failed: {result.error}", flush=True)
        return result
