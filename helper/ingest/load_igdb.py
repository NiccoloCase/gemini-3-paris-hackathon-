"""Step 1: load and filter IGDB-style CSV files."""

from __future__ import annotations

import ast
from typing import Iterable

import pandas as pd

RETRO_PLATFORMS = [
    "Atari 2600",
    "Atari 7800",
    "NES",
    "SNES",
    "Sega Genesis",
    "Arcade",
    "Game Boy",
    "Commodore 64",
]


def _safe_parse_list_like(value: object) -> list:
    if pd.isna(value):
        return []

    if isinstance(value, list):
        return value

    if isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            return []
        try:
            parsed = ast.literal_eval(stripped)
            return parsed if isinstance(parsed, list) else [str(parsed)]
        except (ValueError, SyntaxError):
            # Fallback for plain comma-separated values.
            return [part.strip() for part in stripped.split(",") if part.strip()]

    return []


def _contains_any_platform(platforms: Iterable[str], allowed: Iterable[str]) -> bool:
    platform_set = set(platforms)
    return any(platform in platform_set for platform in allowed)


def load_retro_games(
    csv_path: str,
    only_single_player: bool = True,
) -> pd.DataFrame:
    """Load an IGDB CSV and keep only retro games with usable summaries."""
    df = pd.read_csv(csv_path)

    required_columns = {"id", "name", "summary", "genres", "platforms", "game_modes"}
    missing = required_columns - set(df.columns)
    if missing:
        missing_cols = ", ".join(sorted(missing))
        raise ValueError(f"CSV is missing required columns: {missing_cols}")

    for column in ["game_modes", "platforms", "genres"]:
        df[column] = df[column].apply(_safe_parse_list_like)

    df = df[df["platforms"].apply(lambda p: _contains_any_platform(p, RETRO_PLATFORMS))]

    if only_single_player:
        df = df[df["game_modes"].apply(lambda modes: "Single player" in modes)]

    df = df[["id", "name", "summary", "genres", "platforms", "game_modes"]]
    df = df.dropna(subset=["summary"])

    return df.reset_index(drop=True)
