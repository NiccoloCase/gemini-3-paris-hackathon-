"""Step 2: search and download gameplay videos from Internet Archive."""

from __future__ import annotations

from pathlib import Path
from typing import Optional

import internetarchive as ia


def _guess_downloaded_path(output_dir: Path, identifier: str, file_name: str) -> Path:
    direct_path = output_dir / file_name
    nested_path = output_dir / identifier / file_name

    if direct_path.exists():
        return direct_path
    if nested_path.exists():
        return nested_path

    # Best effort fallback when IA uses a custom subfolder structure.
    matches = list(output_dir.rglob(file_name))
    return matches[0] if matches else direct_path


def search_and_download_video(
    game_name: str,
    output_dir: str,
    collection: str = "gamevideos",
) -> Optional[str]:
    """Find and download the first MP4 for a game; return local path or ``None``."""
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    query = f'collection:{collection} AND title:"{game_name}"'
    results = ia.search_items(query, fields=["identifier", "title"])

    for result in results:
        identifier = result.get("identifier")
        if not identifier:
            continue

        try:
            item = ia.get_item(identifier)
        except Exception:
            continue

        for file_info in item.files:
            file_name = file_info.get("name", "")
            if not file_name.lower().endswith(".mp4"):
                continue

            expected_path = _guess_downloaded_path(out_dir, identifier, file_name)
            if expected_path.exists():
                return str(expected_path)

            try:
                ia.download(
                    identifier,
                    files=[file_name],
                    destdir=str(out_dir),
                    ignore_existing=True,
                    no_directory=True,
                )
            except TypeError:
                # Older versions of internetarchive may not support no_directory.
                ia.download(
                    identifier,
                    files=[file_name],
                    destdir=str(out_dir),
                    ignore_existing=True,
                )
            except Exception:
                continue

            downloaded_path = _guess_downloaded_path(out_dir, identifier, file_name)
            if downloaded_path.exists():
                return str(downloaded_path)

    return None
