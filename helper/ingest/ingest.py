"""Backward-compatible entrypoint for the original helper ingestion script."""

from helper.ingest.load_igdb import RETRO_PLATFORMS, load_retro_games

__all__ = ["RETRO_PLATFORMS", "load_retro_games"]
