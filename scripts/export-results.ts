/**
 * Exports all stored Pheydrus calculator submissions from Vercel Blob to CSV.
 *
 * Run:
 *   npx tsx scripts/export-results.ts                  # writes ./exports/results-YYYY-MM-DD.csv
 *   npx tsx scripts/export-results.ts --out foo.csv    # custom path
 *   npx tsx scripts/export-results.ts --limit 10       # only most recent N
 *
 * Needs BLOB_PUBLIC_READ_WRITE_TOKEN_READ_WRITE_TOKEN in env (.env or shell).
 *
 * Opens directly in Excel / Google Sheets / Numbers.
 */

import 'dotenv/config';
import { list } from '@vercel/blob';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

// ── Arg parsing ───────────────────────────────────────────────────────────────

function getArg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const today = new Date().toISOString().slice(0, 10);
const outPath = resolve(getArg('--out') ?? `exports/results-${today}.csv`);
const limit = getArg('--limit') ? Number(getArg('--limit')) : Infinity;

const token = process.env.BLOB_PUBLIC_READ_WRITE_TOKEN_READ_WRITE_TOKEN;
if (!token) {
  console.error('Missing BLOB_PUBLIC_READ_WRITE_TOKEN_READ_WRITE_TOKEN in env.');
  process.exit(1);
}

// ── CSV encoder ───────────────────────────────────────────────────────────────

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'string' ? v : String(v);
  // Quote if contains comma, quote, newline, or leading/trailing whitespace
  if (/[",\n\r]/.test(s) || s !== s.trim()) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(cells: unknown[]): string {
  return cells.map(csvCell).join(',');
}

// ── Types ─────────────────────────────────────────────────────────────────────

type PillarLike = {
  items?: Array<{ grade: string }>;
  fCount?: number;
  cCount?: number;
  aCount?: number;
};

type StoredPayload = {
  name?: string;
  email?: string;
  storedAt?: string;
  intake?: {
    phone?: string;
    marketingConsent?: boolean;
    addressMoveDate?: string;
    desiredOutcome?: string;
    obstacle?: string;
    patternYear?: string;
    priorHelp?: string[];
    preferredSolution?: string;
    currentSituation?: string;
    additionalNotes?: string;
  };
  results?: {
    userInfo?: {
      dateOfBirth?: string;
      timeOfBirth?: string;
      birthLocation?: string;
      currentLocation?: string;
      address?: string;
    };
    calculators?: {
      transits?: { risingSign?: string };
    };
    diagnostic?: {
      pillars?: PillarLike[];
      finalGrade?: string;
      score?: number;
      totalFs?: number;
      totalCs?: number;
      totalAs?: number;
    };
  };
};

// ── Column definition ─────────────────────────────────────────────────────────

type Row = Record<string, unknown>;

const COLUMNS: Array<keyof Row | string> = [
  'id',
  'storedAt',
  'name',
  'email',
  'phone',
  'marketingConsent',
  'dateOfBirth',
  'timeOfBirth',
  'birthLocation',
  'currentLocation',
  'address',
  'addressMoveDate',
  'desiredOutcome',
  'obstacle',
  'patternYear',
  'priorHelp',
  'preferredSolution',
  'currentSituation',
  'additionalNotes',
  'finalGrade',
  'score',
  'totalFs',
  'totalCs',
  'totalAs',
  'pillar1_grade',
  'pillar1_fs',
  'pillar1_cs',
  'pillar1_as',
  'pillar2_grade',
  'pillar2_fs',
  'pillar2_cs',
  'pillar2_as',
  'pillar3_grade',
  'pillar3_fs',
  'pillar3_cs',
  'pillar3_as',
  'risingSign',
  'reportUrl',
];

function pillarLetterGrade(p: {
  items?: Array<{ grade: string }>;
  fCount?: number;
  cCount?: number;
}): string {
  const items = p?.items ?? [];
  const fCount = p?.fCount ?? 0;
  const cCount = p?.cCount ?? 0;
  if (items.some((i) => i.grade === 'F') || fCount > 0) return 'F';
  if (items.some((i) => i.grade === 'C') || cCount > 0) return 'C';
  return 'A';
}

function flattenRow(id: string, data: StoredPayload): Row {
  const u = data.results?.userInfo ?? {};
  const d = data.results?.diagnostic ?? {};
  const intake = data.intake ?? {};
  const pillars = Array.isArray(d.pillars) ? d.pillars : [];
  const [p1, p2, p3] = pillars;
  const transits = data.results?.calculators?.transits ?? {};

  return {
    id,
    storedAt: data.storedAt ?? '',
    name: data.name ?? '',
    email: data.email ?? '',
    phone: intake.phone ?? '',
    marketingConsent: intake.marketingConsent ? 'yes' : 'no',
    dateOfBirth: u.dateOfBirth ?? '',
    timeOfBirth: u.timeOfBirth ?? '',
    birthLocation: u.birthLocation ?? '',
    currentLocation: u.currentLocation ?? '',
    address: u.address ?? '',
    addressMoveDate: intake.addressMoveDate ?? '',
    desiredOutcome: intake.desiredOutcome ?? '',
    obstacle: intake.obstacle ?? '',
    patternYear: intake.patternYear ?? '',
    priorHelp: Array.isArray(intake.priorHelp) ? intake.priorHelp.join('; ') : '',
    preferredSolution: intake.preferredSolution ?? '',
    currentSituation: intake.currentSituation ?? '',
    additionalNotes: intake.additionalNotes ?? '',
    finalGrade: d.finalGrade ?? '',
    score: d.score ?? '',
    totalFs: d.totalFs ?? 0,
    totalCs: d.totalCs ?? 0,
    totalAs: d.totalAs ?? 0,
    pillar1_grade: p1 ? pillarLetterGrade(p1) : '',
    pillar1_fs: p1?.fCount ?? 0,
    pillar1_cs: p1?.cCount ?? 0,
    pillar1_as: p1?.aCount ?? 0,
    pillar2_grade: p2 ? pillarLetterGrade(p2) : '',
    pillar2_fs: p2?.fCount ?? 0,
    pillar2_cs: p2?.cCount ?? 0,
    pillar2_as: p2?.aCount ?? 0,
    pillar3_grade: p3 ? pillarLetterGrade(p3) : '',
    pillar3_fs: p3?.fCount ?? 0,
    pillar3_cs: p3?.cCount ?? 0,
    pillar3_as: p3?.aCount ?? 0,
    risingSign: transits.risingSign ?? '',
    reportUrl: `https://pheydrus-combined-calculator-sigma.vercel.app/client/results?id=${id}`,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const { blobs } = await list({ prefix: 'results/', token });
  const jsonBlobs = blobs
    .filter((b) => b.pathname.endsWith('.json'))
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, limit);

  console.log(`Fetching ${jsonBlobs.length} of ${blobs.length} submission(s)…`);

  const rows: Row[] = [];
  for (const [i, b] of jsonBlobs.entries()) {
    const id = b.pathname.replace(/^results\//, '').replace(/\.json$/, '');
    process.stdout.write(`  [${i + 1}/${jsonBlobs.length}] ${id}…`);
    try {
      const res = await fetch(b.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as StoredPayload;
      rows.push(flattenRow(id, data));
      process.stdout.write(' ✓\n');
    } catch (err) {
      process.stdout.write(` ✗ (${(err as Error).message})\n`);
    }
  }

  // Prepend UTF-8 BOM so Excel opens non-ASCII characters correctly
  const bom = '\uFEFF';
  const csv =
    bom +
    csvRow(COLUMNS) +
    '\n' +
    rows.map((r) => csvRow(COLUMNS.map((c) => r[c as keyof Row]))).join('\n') +
    '\n';

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, csv, 'utf8');

  console.log(`\nWrote ${rows.length} row(s) → ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
