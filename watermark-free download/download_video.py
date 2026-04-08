#!/usr/bin/env python3
import argparse
import pathlib
import shutil
import yt_dlp


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Download video files using yt-dlp for Canva/Google Drive workflows."
    )
    parser.add_argument("url", help="Instagram/TikTok/YouTube URL")
    parser.add_argument(
        "--output-dir",
        default="downloads",
        help="Folder where the video will be saved (default: downloads)",
    )
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    out_dir = pathlib.Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    ydl_opts = {
        # Use platform video ID to avoid collisions like "Video by <account>.mp4".
        "outtmpl": str(out_dir / "%(id)s.%(ext)s"),
        "format": "bestvideo+bestaudio/best",
        "merge_output_format": "mp4",
        "noplaylist": True,
    }

    if shutil.which("ffmpeg") is None:
        try:
            import imageio_ffmpeg  # type: ignore

            ydl_opts["ffmpeg_location"] = imageio_ffmpeg.get_ffmpeg_exe()
        except Exception:
            pass

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(args.url, download=True)

    video_id = info.get("id") if isinstance(info, dict) else None
    if video_id:
        final_file = out_dir / f"{video_id}.mp4"
        if final_file.exists():
            print(f"FINAL_FILE={final_file}")
            return

    # Fallback if a platform/format outputs a different extension.
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        fallback = ydl.prepare_filename(info)
    print(f"FINAL_FILE={fallback}")


if __name__ == "__main__":
    main()
