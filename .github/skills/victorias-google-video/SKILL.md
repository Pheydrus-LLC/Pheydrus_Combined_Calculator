# Victorias Google Video

## Purpose
Use this skill for one consistent, single-command Google Drive video pipeline:
1. Add burned-in captions to the Drive video
2. Create transcript in Google Doc
3. Post one consolidated Slack message with original video, captioned video, and doc links

## Command
npm run "victorias google video" -- "<drive_video_link>"

You can pass multiple links:
npm run "victorias google video" -- "<drive_link_1>" "<drive_link_2>"

Optional flag:
- --skip-slack (runs pipeline but skips Slack post)

## Script Used
- scripts/victorias-google-video.ts

## What It Runs Internally
- scripts/add-captions-to-drive-videos.ts
- scripts/transcript-to-gdoc-slack.ts --no-slack
- Slack post with all final links in one message

## Required Env Vars
- GOOGLE_OAUTH_CLIENT_ID
- GOOGLE_OAUTH_CLIENT_SECRET
- GOOGLE_OAUTH_REFRESH_TOKEN
- GETTRANSCRIBE_KEY
- SLACK_TRANSCRIPT_WEBHOOK_URL (or SLACK_WEBHOOK_URL)

## Optional Env Vars
- OPENAI_API_KEY (if missing, local Whisper fallback is used)
- CAPTION_LANGUAGE (default: en)
- CAPTION_MAX_CHARS (default: 24)
- CAPTION_MAX_LINES (default: 3)
- SLACK_TRANSCRIPT_CHANNEL (default: #video-transcripts)

## Output Per Video
- Original Drive video URL
- New captioned Drive video URL
- Google Doc transcript URL
- Slack confirmation status

## Notes
- Original files are not modified.
- Captioned files are uploaded as new Drive files.
- The command returns non-zero exit code if any input link fails.
