"""Steps 4+5: generate embeddings with Gemini and store docs in MongoDB."""

from __future__ import annotations

import os
import time
from pathlib import Path
from typing import Any, Optional

from dotenv import load_dotenv
from google import genai
from google.genai import types
from pymongo import MongoClient

load_dotenv()

DEFAULT_EMBED_MODEL = "gemini-embedding-2-preview"
EMBED_DIM = 1536


def _extract_embedding_values(response: Any) -> list[float]:
    embeddings = getattr(response, "embeddings", None)
    if embeddings:
        first = embeddings[0]
        values = getattr(first, "values", first)
        return list(values)

    embedding = getattr(response, "embedding", None)
    if embedding is not None:
        values = getattr(embedding, "values", embedding)
        return list(values)

    if isinstance(response, dict):
        if "embeddings" in response and response["embeddings"]:
            return list(response["embeddings"][0].get("values", []))
        if "embedding" in response:
            values = response["embedding"].get("values", response["embedding"])
            return list(values)

    raise ValueError("Unable to parse embedding response")


def get_gemini_client(api_key: Optional[str] = None) -> genai.Client:
    """Create a Gemini client from explicit key or env vars."""
    resolved_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not resolved_key:
        raise ValueError("Missing GEMINI_API_KEY/GOOGLE_API_KEY")
    return genai.Client(api_key=resolved_key)


def get_mongo_collection(
    mongo_uri: Optional[str] = None,
    db_name: str = "game_rag",
    collection_name: str = "chunks",
):
    """Create MongoDB collection handle from URI."""
    resolved_uri = mongo_uri or os.getenv("MONGODB_URI")
    if not resolved_uri:
        raise ValueError("Missing MONGODB_URI")

    client = MongoClient(resolved_uri)
    return client[db_name][collection_name]


def embed_text(
    client_gemini: genai.Client,
    text: str,
    embed_dim: int = EMBED_DIM,
    model: str = DEFAULT_EMBED_MODEL,
    task_type: str = "RETRIEVAL_DOCUMENT",
) -> list[float]:
    """Embed text chunks for document retrieval."""
    resp = client_gemini.models.embed_content(
        model=model,
        contents=text,
        config=types.EmbedContentConfig(
            task_type=task_type,
            output_dimensionality=embed_dim,
        ),
    )
    return _extract_embedding_values(resp)


def embed_video(
    client_gemini: genai.Client,
    video_path: str,
    embed_dim: int = EMBED_DIM,
    model: str = DEFAULT_EMBED_MODEL,
) -> list[float]:
    """Embed a short video chunk."""
    with open(video_path, "rb") as video_file:
        video_bytes = video_file.read()

    try:
        part = types.Part.from_bytes(data=video_bytes, mime_type="video/mp4")
    except AttributeError:
        part = types.Part(inline_data=types.Blob(mime_type="video/mp4", data=video_bytes))

    content = types.Content(role="user", parts=[part])
    resp = client_gemini.models.embed_content(
        model=model,
        contents=[content],
        config=types.EmbedContentConfig(output_dimensionality=embed_dim),
    )
    return _extract_embedding_values(resp)


def ingest_game(
    collection,
    client_gemini: genai.Client,
    game: dict,
    video_chunks: list[dict],
    embed_dim: int = EMBED_DIM,
    sleep_seconds: float = 1.0,
) -> int:
    """Store one text chunk and optional video chunks for a single game."""
    docs: list[dict] = []

    summary = game.get("summary")
    if not summary:
        return 0

    text_embedding = embed_text(
        client_gemini=client_gemini,
        text=summary,
        embed_dim=embed_dim,
    )

    docs.append(
        {
            "game_id": game["id"],
            "game_name": game["name"],
            "chunk_type": "text",
            "chunk_id": f"{game['id']}_text",
            "content": summary,
            "genres": game.get("genres", []),
            "platforms": game.get("platforms", []),
            "game_modes": game.get("game_modes", []),
            "embedding": text_embedding,
        }
    )

    for chunk in video_chunks:
        chunk_path = chunk.get("chunk_path")
        if not chunk_path:
            continue

        if not Path(chunk_path).exists():
            continue

        try:
            video_embedding = embed_video(
                client_gemini=client_gemini,
                video_path=chunk_path,
                embed_dim=embed_dim,
            )
        except Exception as exc:
            print(f"[SKIP] {chunk_path}: {exc}")
            continue

        docs.append(
            {
                "game_id": game["id"],
                "game_name": game["name"],
                "chunk_type": "video",
                "chunk_id": f"{game['id']}_video_{chunk['chunk_idx']}",
                "start_sec": chunk.get("start_sec"),
                "end_sec": chunk.get("end_sec"),
                "video_path": chunk_path,
                "genres": game.get("genres", []),
                "platforms": game.get("platforms", []),
                "game_modes": game.get("game_modes", []),
                "embedding": video_embedding,
            }
        )

        if sleep_seconds > 0:
            time.sleep(sleep_seconds)

    if docs:
        collection.insert_many(docs)

    print(f"[OK] {game['name']} -> {len(docs)} chunks inserted")
    return len(docs)
