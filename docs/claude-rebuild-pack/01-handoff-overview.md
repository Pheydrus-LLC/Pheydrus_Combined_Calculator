# Pheydrus Automation Handoff (Claude Rebuild Pack)

## Goal
Recreate the key automations built in this repository inside Claude.ai with predictable behavior and clear validation steps.

## Current Production Behavior
1. Transcript workflow is active.
2. Client report submission posts to Slack.
3. Client report submission does not sync to FloDesk by default.
4. Calendly booking webhook posts to Slack.

## Workflow 1: Transcript -> Google Doc -> Watermark-Free Video -> Google Drive -> Slack
Trigger:
- Run a command with an Instagram/TikTok URL.

Primary command:
- npm run transcript:send -- <video_url>

What it does:
1. Calls transcription provider for text.
2. Extracts title/CTA from caption when possible.
3. Creates transcript Google Doc.
4. Downloads watermark-free video locally.
5. Uploads video to Google Drive.
6. Posts summary to Slack.

Outputs:
- Google Doc link
- Google Drive file link
- Local transcript markdown file

Key implementation files:
- scripts/transcript-to-gdoc-slack.ts
- scripts/upload-to-drive.ts
- watermark-free download/download_video.py

## Workflow 2: Client Calculator Report Submission -> Slack
Trigger:
- End user submits a report from /client flow.

Backend endpoint:
- POST /api/store-results

What it does:
1. Validates payload.
2. Saves report JSON to Vercel Blob.
3. Builds results URL.
4. Posts Slack notification with grade/score and report link.
5. Attempts FloDesk sync only if explicitly enabled by env flag.

Current FloDesk guard:
- FLODESK_ENABLE_STORE_RESULTS_SYNC must equal true to allow sync.
- If not true, FloDesk sync is skipped.

Key implementation file:
- api/store-results.ts

## Workflow 3: Calendly Booking Webhook -> Slack
Trigger:
- Calendly invitee.created webhook event.

Backend endpoint:
- POST /api/calendly

What it does:
1. Verifies Calendly signature when signing key is configured.
2. Posts booking alert to Slack.
3. Optionally adds subscriber to FloDesk when configured.

Key implementation file:
- api/calendly.ts

## Design Rules To Preserve In Rebuild
1. Slack should still receive events even when optional integrations fail.
2. Optional integrations must fail soft (warn, do not crash core flow).
3. Every workflow should log step-by-step progress.
4. Sensitive keys must stay in env vars only.
5. FloDesk sync for calculator report must be opt-in (disabled by default).

## Suggested Team Rebuild Process In Claude.ai
1. Paste 03-rebuild-prompts.md prompt #1 to scaffold structure.
2. Paste prompt #2 to generate workflows and handlers.
3. Paste prompt #3 to add safety guards and logs.
4. Use 04-validation-checklist.md to verify parity with current behavior.
