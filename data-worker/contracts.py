"""
Fenerbahçe Evreni — data-worker sözleşme katmanı (Faz A1)

TypeScript: src/lib/backend/contracts.ts ile senkron tutulmalı.
Job runner (A3+) bu sabitleri ve belge şekillerini kullanır.
"""

from __future__ import annotations

from typing import Any, Literal

# ── Koleksiyon adları ───────────────────────────────────────────────────────

COLLECTIONS = {
    "players": "players",
    "matches": "matches",
    "standings": "standings",
    "advanced_player_stats": "advancedPlayerStats",
    "advanced_match_stats": "advancedMatchStats",
    "scrape_jobs": "scrapeJobs",
    "provider_ids": "providerIds",
    # Geriye dönük
    "data_sync_runs": "dataSyncRuns",
    "external_player_mappings": "externalPlayerMappings",
}

PROVIDERS = (
    "transfermarkt",
    "fbref",
    "sofascore",
    "fotmob",
    "whoscored",
    "clubelo",
    "api_football",
    "manual",
)

JOB_TYPES = (
    "sync_squad",
    "sync_standings",
    "sync_fixtures",
    "sync_player_season_stats",
    "sync_match_advanced",
    "sync_entity_ids",
    "health_probe",
)

JOB_STATUSES = (
    "queued",
    "running",
    "success",
    "partial",
    "failed",
    "cancelled",
)

JOB_TRIGGERS = ("admin", "scheduler", "cli", "api")

MAPPING_STATUSES = ("review", "confirmed", "rejected")

SCHEMA_VERSION = 1


def advanced_player_stats_id(player_document_id: str, season_key: str, provider: str) -> str:
    return f"{player_document_id}__{season_key}__{provider}"


def advanced_match_stats_id(match_document_id: str, provider: str) -> str:
    return f"{match_document_id}__{provider}"


def new_scrape_job(
    *,
    job_type: str,
    provider: str | list[str],
    season_key: str,
    triggered_by: str = "cli",
    triggered_by_email: str | None = None,
    target: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """scrapeJobs belgesi iskeleti (ISO timestamps runner doldurur)."""
    if job_type not in JOB_TYPES:
        raise ValueError(f"Geçersiz jobType: {job_type}")
    providers = provider if isinstance(provider, list) else [provider]
    for p in providers:
        if p not in PROVIDERS:
            raise ValueError(f"Geçersiz provider: {p}")
    if triggered_by not in JOB_TRIGGERS:
        raise ValueError(f"Geçersiz triggeredBy: {triggered_by}")

    return {
        "schemaVersion": SCHEMA_VERSION,
        "jobType": job_type,
        "provider": provider,
        "status": "queued",
        "seasonKey": season_key,
        "triggeredBy": triggered_by,
        "triggeredByEmail": triggered_by_email,
        "startedAt": None,
        "finishedAt": None,
        "processedCount": 0,
        "successCount": 0,
        "failedCount": 0,
        "recordsWritten": 0,
        "errorSummary": None,
        "target": target or {},
        "meta": {},
        "createdAt": None,  # runner ISO UTC yazar
        "updatedAt": None,
    }


def is_job_type(value: str) -> bool:
    return value in JOB_TYPES


def is_provider(value: str) -> bool:
    return value in PROVIDERS
