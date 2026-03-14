"""Step 7: runtime retrieval over MongoDB Atlas vector index."""

from __future__ import annotations

from typing import Any

from helper.ingest.embed_and_store import EMBED_DIM, embed_text


def build_query_text(user_profile: dict[str, Any]) -> str:
    """Convert user profile preferences into a retrieval-friendly query string."""
    preferred_genres = user_profile.get("preferred_genres", [])
    theme_interests = user_profile.get("theme_interests", [])
    pacing = user_profile.get("style", "fast-paced arcade gameplay with collectibles and enemies")

    genres_text = ", ".join(preferred_genres) if preferred_genres else "arcade"
    themes_text = ", ".join(theme_interests) if theme_interests else "retro"

    return (
        f"Game genres: {genres_text}. "
        f"Theme interests: {themes_text}. "
        f"Style: {pacing}."
    )


def retrieve_games(
    collection,
    client_gemini,
    user_profile: dict[str, Any],
    top_k: int = 5,
    index_name: str = "embedding_index",
    embed_dim: int = EMBED_DIM,
) -> list[dict[str, Any]]:
    """Retrieve and deduplicate recommended games for a user profile."""
    if top_k <= 0:
        raise ValueError("top_k must be > 0")

    query_text = build_query_text(user_profile)
    query_embedding = embed_text(
        client_gemini=client_gemini,
        text=query_text,
        embed_dim=embed_dim,
        task_type="RETRIEVAL_QUERY",
    )

    vector_filter: dict[str, Any] = {}
    if user_profile.get("game_mode"):
        vector_filter["game_modes"] = user_profile["game_mode"]
    if user_profile.get("platform"):
        vector_filter["platforms"] = user_profile["platform"]

    pipeline = [
        {
            "$vectorSearch": {
                "index": index_name,
                "path": "embedding",
                "queryVector": query_embedding,
                "numCandidates": max(top_k * 10, 50),
                "limit": max(top_k * 3, 15),
                **({"filter": vector_filter} if vector_filter else {}),
            }
        },
        {"$addFields": {"score": {"$meta": "vectorSearchScore"}}},
        {"$sort": {"score": -1}},
        {
            "$group": {
                "_id": "$game_id",
                "game_name": {"$first": "$game_name"},
                "best_chunk_type": {"$first": "$chunk_type"},
                "content": {"$first": "$content"},
                "score": {"$first": "$score"},
                "genres": {"$first": "$genres"},
                "platforms": {"$first": "$platforms"},
                "game_modes": {"$first": "$game_modes"},
            }
        },
        {"$sort": {"score": -1}},
        {"$limit": top_k},
    ]

    return list(collection.aggregate(pipeline))
