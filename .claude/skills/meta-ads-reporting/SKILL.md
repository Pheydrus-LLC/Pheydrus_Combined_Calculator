# Skill: /meta-ads-reporting

## Trigger
User types `/meta-ads-reporting <client-slug>` or `/meta-ads-reporting <client-slug> --period=<period>`

## Description
Connects to the Meta Marketing API, pulls every campaign, ad set, and ad for the given client account, scores every creative, detects fatigue, flags spend anomalies, and outputs a prioritized action list.

## Environment Variables Required
- `META_ACCESS_TOKEN` — System user token from Meta Business Settings
- `META_BUSINESS_ID` — Meta Business ID from Business Settings > Business Info
- `DATABASE_URL` — PostgreSQL connection string (Supabase or other)

## Instructions

When this skill is triggered, follow these steps exactly:

### Step 1: Parse Input

Extract the client slug from the command. If no slug is provided, respond:
```
Usage: /meta-ads-reporting <client-slug> [--period=last-7d|last-30d|last-14d]
```
Default period is `last-7d` if not specified.

Map period flags to date_preset values for the Meta API:
- `last-7d` → `last_7d`
- `last-14d` → `last_14d`
- `last-30d` → `last_30d`

### Step 2: Look Up Ad Account

Query the database to find the Meta ad account for this client:

```sql
SELECT 
  c.name as client_name,
  c.industry,
  m.account_id,
  m.account_name
FROM clients c
JOIN ad_account_mappings m ON m.client_id = c.id
WHERE c.slug = '<client-slug>'
  AND m.platform = 'meta_ads'
  AND m.is_active = true;
```

Use the `DATABASE_URL` environment variable for the connection. If no record is found, respond:
```
No active Meta ad account found for client: <client-slug>
Check that the client exists in the clients table and has an active ad_account_mappings entry.
```

### Step 3: Pull Account Status

Call the Meta API to check account health:

```
GET https://graph.facebook.com/v19.0/<account_id>
  ?fields=name,account_status,disable_reason,currency,timezone_name,spend_cap,amount_spent
  &access_token=<META_ACCESS_TOKEN>
```

Account status codes:
- `1` = ACTIVE
- `2` = DISABLED
- `3` = UNSETTLED
- `7` = PENDING_RISK_REVIEW
- `9` = IN_GRACE_PERIOD
- `100` = PENDING_CLOSURE
- `101` = CLOSED

**CRITICAL ALERT** if status != 1.

### Step 4: Pull Campaign Insights

```
GET https://graph.facebook.com/v19.0/<account_id>/campaigns
  ?fields=id,name,status,objective,daily_budget,lifetime_budget,insights.date_preset(<date_preset>){spend,impressions,reach,clicks,ctr,cpc,cpm,actions,action_values,cost_per_action_type,frequency}
  &limit=100
  &access_token=<META_ACCESS_TOKEN>
```

For each campaign, extract:
- spend, impressions, reach, clicks, CTR, CPC, CPM, frequency
- conversions (actions where action_type = "offsite_conversion.fb_pixel_purchase" or "lead")
- conversion value (action_values for same action types)
- CPA = spend / conversions (if conversions > 0)
- ROAS = conversion_value / spend (if spend > 0)

### Step 5: Pull Ad Set Insights

```
GET https://graph.facebook.com/v19.0/<account_id>/adsets
  ?fields=id,name,status,campaign_id,targeting,daily_budget,bid_amount,bid_strategy,optimization_goal,insights.date_preset(<date_preset>){spend,impressions,reach,clicks,ctr,cpc,cpm,actions,cost_per_action_type,frequency}
  &limit=200
  &access_token=<META_ACCESS_TOKEN>
```

Flag `LEARNING_LIMITED` status ad sets.

### Step 6: Pull Ad-Level Insights with Creative Data

```
GET https://graph.facebook.com/v19.0/<account_id>/ads
  ?fields=id,name,status,adset_id,campaign_id,creative{id,name,object_type,video_id,image_url,body,title,call_to_action_type},insights.date_preset(<date_preset>){spend,impressions,reach,clicks,ctr,cpc,cpm,actions,cost_per_action_type,frequency,video_thruplay_watched_actions,video_avg_time_watched_actions,engagement_rate_ranking}
  &limit=200
  &access_token=<META_ACCESS_TOKEN>
```

For video ads (object_type = VIDEO), also pull historical CTR to detect peak:
```
GET https://graph.facebook.com/v19.0/<ad_id>/insights
  ?fields=ctr,frequency,date_start
  &time_increment=1
  &date_preset=last_30d
  &access_token=<META_ACCESS_TOKEN>
```

### Step 7: Score Each Creative

Determine creative type from `object_type`:
- VIDEO → use Video Score formula
- IMAGE or PHOTO → use Image Score formula  
- CAROUSEL or LINK (with multiple child attachments) → use Carousel Score formula

**Normalize all rates to 0–1 range before scoring:**
- CTR: divide raw CTR% by 100
- CVR: conversions / clicks (if clicks > 0, else 0)
- ThruPlay Rate: thruplay_count / impressions (if impressions > 0, else 0)
- Engagement Rate: (clicks + post_engagements) / impressions

**Formulas:**
```
Video Score    = (ThruPlay_Rate × 0.3) + (CTR × 0.3) + (CVR × 0.4)
Image Score    = (CTR × 0.5) + (CVR × 0.5)
Carousel Score = (Engagement_Rate × 0.3) + (CTR × 0.3) + (CVR × 0.4)
```

**Score interpretation:**
- ≥ 0.7 → Strong performer (keep running)
- 0.4–0.69 → Average (monitor for fatigue)
- < 0.4 → Underperformer (consider pausing or refreshing)

### Step 8: Detect Creative Fatigue

For each ad, calculate:
```
Fatigue Score = (Current_CTR / Peak_CTR) × (1 / Current_Frequency)
```
Where `Peak_CTR` is the highest daily CTR in the last 30 days.

**Flag for fatigue if ANY of:**
- Fatigue Score < 0.5
- Frequency > 3 AND CTR has dropped > 15% from peak

### Step 9: Check Spend Anomaly

Compare today's spend (or most recent day's spend) against the 7-day average daily spend.

Flag **CRITICAL Spend Anomaly** if: `today_spend > (avg_daily_spend × 2.0)`

### Step 10: Check CPA Week-over-Week

If you have 14+ days of data, compare last-7d CPA vs prior-7d CPA.

Flag **WARNING CPA Spike** if: `(current_cpa - prior_cpa) / prior_cpa > 0.40`

### Step 11: Generate Report

Output the following formatted report:

---

```
═══════════════════════════════════════════════════════════
META ADS REPORT — <CLIENT NAME>
Account: <account_name> (<account_id>)
Period: <period> | Generated: <date>
═══════════════════════════════════════════════════════════

🚨 ALERTS
─────────────────────────────────────────────────────────
[List each alert here. Format:]
[CRITICAL] <Alert type>: <Description and action>
[WARNING]  <Alert type>: <Description and action>

If no alerts: "✅ No alerts — account looks healthy."

📊 ACCOUNT SUMMARY
─────────────────────────────────────────────────────────
Total Spend:      $<amount>
Impressions:      <number>
Reach:            <number>
Clicks:           <number>
CTR:              <pct>%
CPC:              $<amount>
CPM:              $<amount>
Conversions:      <number>
CPA:              $<amount>
ROAS:             <ratio>x

📈 CAMPAIGN BREAKDOWN
─────────────────────────────────────────────────────────
[For each campaign, one row:]
<Campaign Name>
  Status: <ACTIVE/PAUSED/etc> | Spend: $<x> | CTR: <x>% | CPA: $<x> | ROAS: <x>x

🎨 CREATIVE SCORES (sorted by score, desc)
─────────────────────────────────────────────────────────
[For each ad:]
<Ad Name> [<type>]
  Score: <score> (<Strong/Average/Underperformer>)
  Spend: $<x> | CTR: <x>% | CVR: <x>% | Frequency: <x>
  Fatigue: <FLAGGED 🔴 / OK 🟢> | Fatigue Score: <x>
  [If video:] ThruPlay Rate: <x>%

⚡ AD SET STATUS
─────────────────────────────────────────────────────────
[For each ad set:]
<Ad Set Name>
  Status: <status> | Budget: $<x>/day | Spend: $<x>
  [If LEARNING_LIMITED:] ⚠️ LEARNING_LIMITED — consider consolidating or broadening

🎯 PRIORITIZED RECOMMENDATIONS
─────────────────────────────────────────────────────────
[Generate 3–7 specific, actionable recommendations ranked by impact:]

1. [HIGHEST IMPACT] <specific action> — <reason with data>
2. <specific action> — <reason with data>
3. <specific action> — <reason with data>
...

Recommendations must be specific (name the ad/campaign/ad set), not generic.
Include what to change, why, and expected outcome.

═══════════════════════════════════════════════════════════
```

### Step 12: Error Handling

- If the Meta API returns a 190 error (invalid token): "META_ACCESS_TOKEN is expired or invalid. Generate a new token in Meta Business Settings > System Users."
- If the API returns a 100 error (permissions): "Token is missing required permissions. Ensure ads_read, ads_management, and business_management are enabled."
- If database connection fails: "Could not connect to database. Check DATABASE_URL in .env.local."
- If rate limited (error code 17 or 32): wait 60 seconds and retry once, then surface the error to the user.

## Example Usage

```
/meta-ads-reporting pheydrus
/meta-ads-reporting pheydrus --period=last-30d
/meta-ads-reporting pheydrus --period=last-14d
```
