"""Run the full ingestion pipeline: IGDB -> videos -> chunks -> embeddings -> Mongo."""

from __future__ import annotations

import argparse
from pathlib import Path

from helper.ingest.chunk_videos import chunk_video
from helper.ingest.download_videos import search_and_download_video
from helper.ingest.embed_and_store import get_gemini_client, get_mongo_collection, ingest_game
from helper.ingest.load_igdb import load_retro_games


def run_ingestion(
    csv_path: str,
    workspace_dir: str = "helper/artifacts",
    max_games: int | None = None,
    chunk_duration: int = 75,
    overlap: int = 5,
    sleep_seconds: float = 1.0,
) -> dict:
    """Execute the ingestion flow and return a summary dictionary."""
    df = load_retro_games(csv_path)
    if max_games is not None:
        df = df.head(max_games)

    client_gemini = get_gemini_client()
    collection = get_mongo_collection()

    workspace = Path(workspace_dir)
    videos_root = workspace / "videos"
    chunks_root = workspace / "chunks"
    videos_root.mkdir(parents=True, exist_ok=True)
    chunks_root.mkdir(parents=True, exist_ok=True)

    processed_games = 0
    inserted_docs = 0

    for _, row in df.iterrows():
        game = row.to_dict()

        video_dir = videos_root / str(game["id"])
        chunk_dir = chunks_root / str(game["id"])

        video_path = search_and_download_video(game_name=game["name"], output_dir=str(video_dir))
        chunks = (
            chunk_video(
                video_path=video_path,
                output_dir=str(chunk_dir),
                chunk_duration=chunk_duration,
                overlap=overlap,
            )
            if video_path
            else []
        )

        inserted = ingest_game(
            collection=collection,
            client_gemini=client_gemini,
            game=game,
            video_chunks=chunks,
            sleep_seconds=sleep_seconds,
        )

        inserted_docs += inserted
        processed_games += 1

    return {
        "processed_games": processed_games,
        "inserted_docs": inserted_docs,
        "workspace": str(workspace.resolve()),
    }


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run game RAG ingestion pipeline")
    parser.add_argument("csv_path", help="Path to IGDB CSV")
    parser.add_argument("--workspace-dir", default="helper/artifacts", help="Where to store downloaded/chunked videos")
    parser.add_argument("--max-games", type=int, default=None, help="Optional cap on number of games to ingest")
    parser.add_argument("--chunk-duration", type=int, default=75, help="Chunk duration in seconds")
    parser.add_argument("--overlap", type=int, default=5, help="Chunk overlap in seconds")
    parser.add_argument("--sleep-seconds", type=float, default=1.0, help="Sleep between video embeddings")
    return parser


def main() -> None:
    args = _build_parser().parse_args()
    summary = run_ingestion(
        csv_path=args.csv_path,
        workspace_dir=args.workspace_dir,
        max_games=args.max_games,
        chunk_duration=args.chunk_duration,
        overlap=args.overlap,
        sleep_seconds=args.sleep_seconds,
    )
    print(summary)


if __name__ == "__main__":
    main()
