"""Ingestion helpers for retro game retrieval."""

from .load_igdb import RETRO_PLATFORMS, load_retro_games
from .download_videos import search_and_download_video
from .chunk_videos import chunk_video
from .embed_and_store import (
    DEFAULT_EMBED_MODEL,
    EMBED_DIM,
    embed_text,
    embed_video,
    get_gemini_client,
    get_mongo_collection,
    ingest_game,
)

__all__ = [
    "DEFAULT_EMBED_MODEL",
    "EMBED_DIM",
    "RETRO_PLATFORMS",
    "chunk_video",
    "embed_text",
    "embed_video",
    "get_gemini_client",
    "get_mongo_collection",
    "ingest_game",
    "load_retro_games",
    "search_and_download_video",
]
