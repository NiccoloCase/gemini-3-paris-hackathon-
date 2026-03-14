# Game RAG Helper Pipeline

## Files

- `ingest/load_igdb.py`: load and filter IGDB CSV to retro single-player games.
- `ingest/download_videos.py`: search/download gameplay videos from Internet Archive.
- `ingest/chunk_videos.py`: split videos into <= 75s chunks with overlap.
- `ingest/embed_and_store.py`: Gemini embeddings + MongoDB insert.
- `retrieval/query.py`: runtime vector retrieval and game-level dedup.
- `main_ingest.py`: end-to-end pipeline runner.
- `ingest/test.ipynb`: notebook with function-by-function smoke checks.
- `retrieval/embedding_index.json`: Atlas vector index definition.

## Install

```bash
pip install -r helper/requirements.txt
```

## Env vars

```bash
GEMINI_API_KEY=...
MONGODB_URI=...
```

`GOOGLE_API_KEY` is also supported as fallback.

## Run ingestion

```bash
python -m helper.main_ingest /path/to/igdb_dataset.csv --max-games 20
```
