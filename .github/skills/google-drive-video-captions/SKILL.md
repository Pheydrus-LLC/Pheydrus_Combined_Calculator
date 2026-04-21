# Burned-In Video Captions Only

## Purpose
Use this skill only when the user wants captions burned directly into the video itself.
This skill does not do transcript docs, watermark work, or Slack posting.

## Scope
1. Input video from Google Drive folder, Google Drive file link, or bare Drive ID
2. Transcribe audio to SRT
3. Burn captions into video frames (hardcoded, always visible)
4. Upload captioned file back to Drive

## Script
scripts/add-captions-to-drive-videos.ts

## Required Env Vars
- GOOGLE_OAUTH_CLIENT_ID
- GOOGLE_OAUTH_CLIENT_SECRET
- GOOGLE_OAUTH_REFRESH_TOKEN

## Optional Env Vars
- OPENAI_API_KEY (if missing, local Whisper fallback is used)
- CAPTION_LANGUAGE (default: en)
- DRY_RUN=true (list only)
- CAPTION_MAX_CHARS (default: 24)
- CAPTION_MAX_LINES (default: 3)

## Canonical Caption Style (Persist This)
Always use this ffmpeg force_style preset:

PlayResX=1080,PlayResY=1920,FontName=Arial,FontSize=35,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Bold=0,Outline=0.75,Shadow=0,MarginL=72,MarginR=72,MarginV=140,Alignment=2,WrapStyle=2

### Style Intent
- White text
- Thin black outline
- Not bold
- Bottom-centered
- Left/right safe margins so text stays inside frame

## Safe Wrap Rules (Prevent Off-Screen Overflow)
Before burn-in, rewrite each SRT cue with:
- CAPTION_MAX_CHARS=24
- CAPTION_MAX_LINES=3

This keeps subtitles inside an invisible safe border and avoids text running off left/right edges.

## Run
Dry run:

DRY_RUN=true npx tsx scripts/add-captions-to-drive-videos.ts "<drive_folder_or_file_link>"

Real run:

npx tsx scripts/add-captions-to-drive-videos.ts "<drive_folder_or_file_link>"

Or:

npm run captions:add -- "<drive_folder_or_file_link>"

## Output
For input source.mp4, output is source_captioned.mp4 uploaded to Drive.
Original source remains unchanged.
