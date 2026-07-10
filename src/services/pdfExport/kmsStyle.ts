/**
 * KMS style enforcer for report copy.
 * Keeps output direct and removes banned punctuation/wording.
 */

export function applyKmsStyle(text: string): string {
  if (!text) return text;

  let out = text;

  // Hard rule: no em dashes.
  out = out.replace(/—/g, ' - ');

  // Remove watery adverbs.
  out = out.replace(/\bjust\b/gi, '');
  out = out.replace(/\bactually\b/gi, '');

  // Remove soft hedge words.
  out = out.replace(/\bprobably\b/gi, '');
  out = out.replace(/\bgenuinely\b/gi, '');
  out = out.replace(/\btends to\b/gi, 'often');

  // Replace weak contrast framing with direct statements.
  out = out.replace(/\b[Bb]ut\s+converting\b/g, 'Converting');
  out = out.replace(/\b[Tt]he question is whether\b/g, 'Question:');
  out = out.replace(/\b[Cc]an either\b/g, 'either');

  // Make common report phrasing more direct.
  out = out.replace(/\b[Bb]ased on your 90-day goal,\s*/g, '');
  out = out.replace(/\b[Tt]his period doesn't reward\b/g, 'This period punishes');
  out = out.replace(/\b[Tt]his address creates\b/g, 'This address adds');
  out = out.replace(/\b[Tt]his address forces\b/g, 'This address forces');
  out = out.replace(/\b[Tt]his address requires\b/g, 'This address requires');

  // Clean awkward double connectors left by edits.
  out = out.replace(/\s+-\s+and\s+/g, '. ');
  out = out.replace(/\s+-\s+/g, '. ');

  // Prefer direct claim over negation-first framing.
  out = out.replace(/\b[Ii]t(?:\s+is|'s)\s+not\s+because\s+[^.?!]+[.?!]\s*[Ii]t(?:\s+is|'s)\s+because\s+/g, '');
  out = out.replace(/\b[Nn]ot\s+because\s+[^,.;:!?]+,\s*but\s+because\s+/g, 'Because ');

  // Clean spacing artifacts from removals.
  out = out.replace(/\s{2,}/g, ' ');
  out = out.replace(/\s+([,.;:!?])/g, '$1');
  out = out.trim();

  return out;
}

export function applyKmsStyleToHtml(html: string): string {
  // Safe lightweight pass for full template output.
  return applyKmsStyle(html);
}
