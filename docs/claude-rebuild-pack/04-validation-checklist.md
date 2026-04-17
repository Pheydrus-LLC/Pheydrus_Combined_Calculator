# Validation Checklist (Parity with Current Build)

Use this checklist after your team rebuilds in Claude.ai.

## A. Transcript Workflow

Run:
- npm run transcript:send -- <test_video_url>

Pass criteria:
1. Script prints step-by-step progress.
2. Google Doc is created and link is returned.
3. Watermark-free video is downloaded.
4. Video uploads to Drive target folder.
5. Slack message is posted (unless --no-slack).

Failure triage:
- Transcription fails -> check GETTRANSCRIBE_KEY
- Google Doc/Drive fails -> check Google OAuth/service account vars
- Slack fails -> check transcript or fallback webhook vars

## B. Client Report Submission Workflow

Trigger:
- Submit test report through /client flow or call POST /api/store-results.

Pass criteria:
1. Endpoint returns ok true.
2. Blob/object data is stored.
3. Slack receives report message.
4. FloDesk is not called when FLODESK_ENABLE_STORE_RESULTS_SYNC is unset/false.

Enable FloDesk test:
1. Set FLODESK_ENABLE_STORE_RESULTS_SYNC=true.
2. Submit another test report.
3. Confirm FloDesk call attempts and segment logic.

## C. Calendly Webhook Workflow

Trigger:
- Send invitee.created webhook payload.

Pass criteria:
1. Signature verification passes with configured signing key.
2. Slack booking notification posts.
3. Optional FloDesk sync does not block webhook success.
4. Non invitee.created events are safely skipped.

## D. Operational Readiness

Pass criteria:
1. All required env vars are documented and provisioned.
2. Logs are clear enough for non-engineers to diagnose step failures.
3. Secrets are not logged in plain text.
4. Team can run all commands without manual code changes.

## E. Team Acceptance

Definition of done:
1. One non-engineer runs transcript workflow successfully.
2. One operator verifies report -> Slack behavior.
3. One operator verifies FloDesk remains disabled by default.
4. Owners are assigned for Slack, Google, Calendly, and FloDesk keys.
