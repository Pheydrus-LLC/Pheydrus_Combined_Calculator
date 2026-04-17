# Claude.ai Rebuild Prompts

Use these prompts in order. Keep each prompt in a new Claude chat to reduce context drift.

## Prompt 1: Scaffold

Build a Node + TypeScript project that supports three automations:
1. Transcript pipeline from social URL to Google Doc, watermark-free video upload to Google Drive, then Slack notification.
2. Client report submit API endpoint that stores report data and posts to Slack.
3. Calendly booking webhook endpoint that posts to Slack.

Requirements:
- Use clear folder structure with scripts and api handlers.
- Add package scripts for transcript:send and calendly:check.
- Include robust logging at every major step.
- Optional integrations must fail soft and not break core flow.
- Output file tree and all file contents.

## Prompt 2: Transcript Pipeline

Implement transcript workflow command:
npm run transcript:send -- <video_url> [--title "Title"] [--cta "CTA"] [--no-slack]

Behavior:
1. Load env from .env and .env.local.
2. Transcribe video using GETTRANSCRIBE_KEY.
3. Create Google Doc via OAuth or service-account auth.
4. Download watermark-free video locally.
5. Upload downloaded video to Google Drive folder.
6. Post result summary to Slack.
7. Print final links (doc + drive) and local transcript path.

Constraints:
- Keep command idempotent where possible.
- Keep logs readable for non-engineers.
- If Slack fails, workflow should still complete and return links.

## Prompt 3: Report Submission Endpoint

Implement POST /api/store-results endpoint.

Input:
- name, email, results, intake

Behavior:
1. Validate request.
2. Save payload to blob/object store.
3. Build results URL.
4. Post Slack message with name/email/grade/score/link.
5. Support optional FloDesk sync only when FLODESK_ENABLE_STORE_RESULTS_SYNC equals true.
6. If FloDesk is disabled or fails, return success anyway after Slack/store steps.

Critical rule:
- Default state must not sync report submissions to FloDesk.

## Prompt 4: Calendly Webhook Endpoint

Implement POST /api/calendly endpoint.

Behavior:
1. Verify Calendly signature using CALENDLY_WEBHOOK_SIGNING_KEY.
2. Process only invitee.created event.
3. Post booking notification to Slack.
4. Optionally sync invitee to FloDesk when configured.
5. Never fail webhook processing due to optional integration errors.

## Prompt 5: Add Verification Commands

Create commands and simple tests/check scripts that prove:
1. Transcript command completes and outputs doc + drive links.
2. Store-results posts to Slack without FloDesk sync by default.
3. FloDesk sync can be enabled only by explicit env flag.
4. Calendly webhook posts to Slack for invitee.created.

Output expected sample logs and expected success/failure states.
