# Environment Variable Contract

This contract is the minimum env mapping needed to reproduce the automations.

## Transcript Workflow

Required:
- GETTRANSCRIBE_KEY
  - Used by transcription step in scripts/transcript-to-gdoc-slack.ts
- GOOGLE_DRIVE_WATERMARK_FREE_FOLDER_ID
  - Target Drive folder for uploaded watermark-free videos

Google auth (choose one mode):
- OAuth mode:
  - GOOGLE_OAUTH_CLIENT_ID
  - GOOGLE_OAUTH_CLIENT_SECRET
  - GOOGLE_OAUTH_REFRESH_TOKEN
- Service account mode:
  - GOOGLE_SERVICE_ACCOUNT_EMAIL
  - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

Optional:
- GOOGLE_DRIVE_FOLDER_ID
  - Folder for transcript Google Docs
- SLACK_TRANSCRIPT_WEBHOOK_URL
  - Preferred dedicated transcript channel webhook
- SLACK_WEBHOOK_URL
  - Generic fallback webhook
- SLACK_TRANSCRIPT_CHANNEL
  - Defaults to #video-transcripts

## Client Report Submission Workflow (/api/store-results)

Required:
- BLOB_PUBLIC_READ_WRITE_TOKEN_READ_WRITE_TOKEN
  - Save report JSON to Vercel Blob
- SLACK_WEBHOOK_URL
  - Post report submissions to Slack
- APP_URL
  - Build results page link for Slack message

Optional:
- FLODESK_ENABLE_STORE_RESULTS_SYNC
  - Must be true to enable FloDesk sync from this endpoint
  - Recommended default: unset or false
- FLODESK_API_KEY
- FLODESK_CALCULATOR_USED_SEGMENT_ID
- FLODESK_CALCULATOR_USED_SEGMENT_NAME
- FLODESK_CALCULATOR_SEGMENT_ID

## Calendly Webhook Workflow (/api/calendly)

Required:
- SLACK_WEBHOOK_URL
- CALENDLY_WEBHOOK_SIGNING_KEY

Optional:
- FLODESK_API_KEY
- FLODESK_SEGMENT_ID

## Calendly Availability Check Script

Required:
- CALENDLY_API_TOKEN
- SLACK_ALERT_WEBHOOK_URL

Fallback webhook support:
- SLACK_WEBHOOK_URL
- SLACK_TRANSCRIPT_WEBHOOK_URL

Optional:
- CALENDLY_EVENT_URL
- CALENDLY_CONTACT_SLACK_IDS
- CALENDLY_CONTACT_SLACK_ID
- SLACK_ALERT_CHANNEL

## Security and Operations Notes
1. Never hardcode keys in code.
2. Keep separate values for local and production.
3. Document owner for each key group (Google, Slack, FloDesk, Calendly).
4. For rebuild parity, keep FloDesk calculator sync opt-in only.
