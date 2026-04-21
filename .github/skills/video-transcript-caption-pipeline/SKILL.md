# Video Transcript + Watermark + Burned Captions + Slack

## Purpose
Use this skill when the user wants one end-to-end video workflow:
1. Transcript saved to Google Doc
2. Watermark check/removal when applicable
3. Captions burned into the video (inside-frame safe layout)
4. Final links posted to Slack

## Inputs
- drive_video_link: Google Drive video URL (or Drive file ID)
- original_video_link: source social URL when available (IG/TikTok/YouTube/Reels)

## Required Env Vars
- GOOGLE_OAUTH_CLIENT_ID
- GOOGLE_OAUTH_CLIENT_SECRET
- GOOGLE_OAUTH_REFRESH_TOKEN
- SLACK_TRANSCRIPT_WEBHOOK_URL (or SLACK_WEBHOOK_URL)

## Optional Env Vars
- OPENAI_API_KEY (if missing, local Whisper fallback is used)
- CAPTION_LANGUAGE (default: en)
- SLACK_TRANSCRIPT_CHANNEL (default: #video-transcripts)
- CAPTION_MAX_CHARS (default: 24)
- CAPTION_MAX_LINES (default: 3)

## Components Used
- scripts/transcript-to-gdoc-slack.ts
- scripts/add-captions-to-drive-videos.ts
- watermark-free download/download_video.py
- scripts/upload-to-drive.ts

## Canonical Caption Style (Must Match Captions-Only Skill)
When running Step 3, captions must use this exact style preset:

PlayResX=1080,PlayResY=1920,FontName=Arial,FontSize=35,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Bold=0,Outline=0.75,Shadow=0,MarginL=72,MarginR=72,MarginV=140,Alignment=2,WrapStyle=2

And safe-wrap rules:
- CAPTION_MAX_CHARS=24
- CAPTION_MAX_LINES=3

## Execution Order
### Step 1: Transcript to Google Doc
Run transcript pipeline against original_video_link when possible:

npx tsx scripts/transcript-to-gdoc-slack.ts "<original_video_link>"

### Step 2: Watermark handling
- If original_video_link is social URL, produce/download watermark-free source first.
- If only Drive link exists, watermark removal may not be applicable automatically.

### Step 3: Burn captions into video
Run:

npm run captions:add -- "<drive_video_link>"

Expected output: original_name_captioned.ext in Drive.

### Step 4: Post final Slack message
Post one consolidated message containing:
- Google Doc URL
- Captioned Drive video URL
- Original source URL

## Slack Message Template
Video Processing Complete
Google Doc: <DOC_URL>
Drive Video: <DRIVE_VIDEO_URL>
Original: <ORIGINAL_VIDEO_URL>

## Notes
- Keep the original file untouched.
- Always upload a new captioned file.
- For multi-video requests, validate one sample first before batch processing.
