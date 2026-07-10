# Lightweight package init — avoid importing soccerdata on every providers.* import.
# Heavy modules: sofascore_superlig, fotmob, fbref_superlig, api_football (import directly).

from __future__ import annotations

__all__ = ["SuperLigSofascore", "create_superlig_reader"]


def __getattr__(name: str):
    if name in ("SuperLigSofascore", "create_superlig_reader"):
        from .sofascore_superlig import SuperLigSofascore, create_superlig_reader

        return {
            "SuperLigSofascore": SuperLigSofascore,
            "create_superlig_reader": create_superlig_reader,
        }[name]
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
