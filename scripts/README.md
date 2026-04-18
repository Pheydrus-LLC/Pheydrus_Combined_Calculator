# Scripts

Utility scripts for data operations and content workflows.

---

## `export-results.ts` — Export calculator submissions to CSV

Fetches every stored Pheydrus calculator submission from Vercel Blob and writes a flat CSV suitable for Excel, Numbers, or Google Sheets.

### Prerequisites

1. Node 18+ and project dependencies installed:
   ```
   npm install
   ```
2. The Blob read token must be available as an environment variable named
   `BLOB_PUBLIC_READ_WRITE_TOKEN_READ_WRITE_TOKEN`.

### Getting the token

Either of the following works:

**Via Vercel CLI (recommended):**

```
npm i -g vercel            # if not already installed
vercel link                # pick the team and project, interactive
vercel env pull .env       # writes token + other env vars to .env
```

`.env` is gitignored, so this is safe.

**Via Vercel dashboard:**

Go to Vercel → your project → **Storage** → **pheydrus-blob-public** → **.env.local** tab and copy the `BLOB_PUBLIC_READ_WRITE_TOKEN_READ_WRITE_TOKEN=...` line into your local `.env` file.

### Running

From the repository root:

```
npx tsx scripts/export-results.ts
```

Output goes to `exports/results-YYYY-MM-DD.csv` (relative to the repo root).

**Flags:**

| Flag           | Effect                                                       |
| -------------- | ------------------------------------------------------------ |
| `--out <path>` | Write to a custom path instead of the default dated filename |
| `--limit <N>`  | Only export the most recent N submissions (by upload time)   |

**Examples:**

```
npx tsx scripts/export-results.ts                         # full export, dated filename
npx tsx scripts/export-results.ts --out exports/all.csv   # custom path
npx tsx scripts/export-results.ts --limit 10              # 10 most recent only
```

### Output format

One row per submission. 37 columns grouped as follows:

| Group       | Columns                                                                                                              |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| Identifiers | `id`, `storedAt`, `reportUrl`                                                                                        |
| Contact     | `name`, `email`, `phone`, `marketingConsent`                                                                         |
| Birth info  | `dateOfBirth`, `timeOfBirth`, `birthLocation`                                                                        |
| Location    | `currentLocation`, `address`, `addressMoveDate`                                                                      |
| Intake      | `desiredOutcome`, `obstacle`, `patternYear`, `priorHelp`, `preferredSolution`, `currentSituation`, `additionalNotes` |
| Scoring     | `finalGrade`, `score`, `totalFs`, `totalCs`, `totalAs`                                                               |
| Pillars     | `pillar{1,2,3}_grade`, `pillar{1,2,3}_{fs,cs,as}`                                                                    |
| Astro       | `risingSign`                                                                                                         |

The file starts with a UTF-8 BOM so Excel renders emoji and accented characters correctly. Multi-line fields (e.g., `additionalNotes`) are quoted per RFC 4180 — most spreadsheet apps open them as a single row without extra configuration.

### Safety

- `exports/` is gitignored. Exported files contain client PII (name, email, phone, DOB, home address, free-text answers) and must never be committed.
- The Blob token has read + write + delete permissions on the bucket. Do not paste it into chat, share it in screenshots, or commit it. Rotate it in the Vercel dashboard if it is ever exposed.
- If you open the CSV in a shared tool (Google Sheets, a shared Excel workbook), ensure the sharing scope matches the sensitivity of the data.

### Troubleshooting

| Error                                                           | Fix                                                                                                                        |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `Missing BLOB_PUBLIC_READ_WRITE_TOKEN_READ_WRITE_TOKEN in env.` | Set the variable in `.env` (see "Getting the token").                                                                      |
| `Cannot find package '@vercel/blob'`                            | Run `npm install` from the repo root.                                                                                      |
| One or more rows show `✗ (HTTP 404)`                            | That blob was deleted from Vercel between listing and fetching. Re-run the script.                                         |
| CSV shows garbled characters in Excel                           | Ensure you opened the file produced by this script (it includes a UTF-8 BOM). Legacy Excel without BOM misreads non-ASCII. |
