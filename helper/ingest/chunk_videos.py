"""Step 3: split gameplay videos into short clips for multimodal embeddings."""

from __future__ import annotations

from pathlib import Path

from moviepy.video.io.VideoFileClip import VideoFileClip


def chunk_video(
    video_path: str,
    output_dir: str,
    chunk_duration: int = 75,
    overlap: int = 5,
) -> list[dict]:
    """Split a video into overlapping chunks and return chunk metadata."""
    if chunk_duration <= 0:
        raise ValueError("chunk_duration must be > 0")
    if overlap < 0:
        raise ValueError("overlap must be >= 0")
    if overlap >= chunk_duration:
        raise ValueError("overlap must be smaller than chunk_duration")

    input_path = Path(video_path)
    if not input_path.exists():
        raise FileNotFoundError(f"Video not found: {video_path}")

    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    clips_metadata: list[dict] = []
    step = chunk_duration - overlap

    with VideoFileClip(str(input_path)) as video:
        total_duration = float(video.duration)
        start = 0.0
        chunk_idx = 0

        while start < total_duration:
            end = min(start + chunk_duration, total_duration)
            if end <= start:
                break

            chunk_path = out_dir / f"chunk_{chunk_idx:03d}.mp4"
            clip = video.subclip(start, end)
            clip.write_videofile(str(chunk_path), logger=None)
            clip.close()

            clips_metadata.append(
                {
                    "chunk_path": str(chunk_path),
                    "start_sec": round(start, 3),
                    "end_sec": round(end, 3),
                    "chunk_idx": chunk_idx,
                }
            )

            start += step
            chunk_idx += 1

    return clips_metadata
