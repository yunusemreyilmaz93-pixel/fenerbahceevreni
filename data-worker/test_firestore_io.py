#!/usr/bin/env python3
"""Unit tests for firestore_io pure helpers (no firebase_admin required)."""
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from firestore_io import (  # noqa: E402
    apply_locked_fields,
    doc_id_from_payload,
    resolve_service_account_path,
)


class TestResolveCredentials(unittest.TestCase):
    def test_missing(self):
        path, reason = resolve_service_account_path({})
        self.assertIsNone(path)
        self.assertEqual(reason, "missing")

    def test_path_not_found(self):
        path, reason = resolve_service_account_path(
            {"FIREBASE_SERVICE_ACCOUNT_JSON": "Z:/no/such/sa-file-xyz.json"}
        )
        self.assertIsNone(path)
        self.assertEqual(reason, "path_not_found")

    def test_path_ok(self):
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
            json.dump({"type": "service_account", "project_id": "demo"}, f)
            f.flush()
            name = f.name
        try:
            path, reason = resolve_service_account_path(
                {"FIREBASE_SERVICE_ACCOUNT_JSON": name}
            )
            self.assertEqual(reason, "ok")
            self.assertTrue(path and Path(path).is_file())
        finally:
            Path(name).unlink(missing_ok=True)

    def test_inline_json(self):
        raw = json.dumps({"type": "service_account", "project_id": "demo-proj"})
        path, reason = resolve_service_account_path(
            {"FIREBASE_SERVICE_ACCOUNT_JSON": raw}
        )
        self.assertEqual(reason, "ok")
        self.assertTrue(path and Path(path).is_file())
        if path:
            Path(path).unlink(missing_ok=True)

    def test_gac(self):
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
            json.dump({"project_id": "x"}, f)
            f.flush()
            name = f.name
        try:
            path, reason = resolve_service_account_path(
                {"GOOGLE_APPLICATION_CREDENTIALS": name}
            )
            self.assertEqual(reason, "ok")
            self.assertTrue(path)
        finally:
            Path(name).unlink(missing_ok=True)


class TestLockedFields(unittest.TestCase):
    def test_preserves_locked(self):
        existing = {
            "formRating": 8.5,
            "goals": 3,
            "lockedFields": ["formRating"],
        }
        incoming = {"formRating": 1.0, "goals": 99, "provider": "fotmob"}
        out = apply_locked_fields(existing, incoming)
        self.assertEqual(out["formRating"], 8.5)
        self.assertEqual(out["goals"], 99)
        self.assertEqual(out["provider"], "fotmob")
        self.assertEqual(out["lockedFields"], ["formRating"])

    def test_job_cannot_replace_locked_list(self):
        existing = {"a": 1, "lockedFields": ["a"]}
        incoming = {"a": 2, "lockedFields": []}
        out = apply_locked_fields(existing, incoming)
        self.assertEqual(out["a"], 1)
        self.assertEqual(out["lockedFields"], ["a"])


class TestDocId(unittest.TestCase):
    def test_id_and_slug(self):
        self.assertEqual(doc_id_from_payload({"id": "x"}), "x")
        self.assertEqual(doc_id_from_payload({"slug": "y"}), "y")
        self.assertIsNone(doc_id_from_payload({}))


if __name__ == "__main__":
    unittest.main()
