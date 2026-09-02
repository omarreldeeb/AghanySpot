#!/usr/bin/env node
/**
 * Detect and trim leading silence from MP3s in Songs/.
 * Uses ffmpeg silencedetect + silenceremove. Re-encodes trimmed files only.
 *
 * Usage:
 *   node scripts/trim-leading-silence.mjs          # trim files with >= 40ms leading silence
 *   node scripts/trim-leading-silence.mjs --dry-run # report only, no changes
 *   node scripts/trim-leading-silence.mjs --min 0.02
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const songsDir = path.resolve(rootDir, 'Songs');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const minIdx = args.indexOf('--min');
const minSilence = minIdx >= 0 ? Number.parseFloat(args[minIdx + 1]) : 0.04;
const thresholdDb = '-35dB';

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
}

function detectLeadingSilence(filePath) {
  const output = run(
    `ffmpeg -hide_banner -i ${JSON.stringify(filePath)} -af silencedetect=noise=${thresholdDb}:d=0.02 -f null - 2>&1`,
  );
  const startMatch = output.match(/silence_start: ([\d.]+)/);
  const endMatch = output.match(/silence_end: ([\d.]+)/);

  if (!startMatch || !endMatch) return 0;
  if (Number.parseFloat(startMatch[1]) > 0.05) return 0;

  return Number.parseFloat(endMatch[1]);
}

function trimLeadingSilence(filePath) {
  const tmpPath = `${filePath}.trim-tmp.mp3`;
  run(
    `ffmpeg -y -hide_banner -loglevel error -i ${JSON.stringify(filePath)} -af "silenceremove=start_periods=1:start_duration=0:start_threshold=${thresholdDb}:detection=peak" -codec:a libmp3lame -q:a 2 ${JSON.stringify(tmpPath)}`,
  );
  fs.renameSync(tmpPath, filePath);
}

const mp3s = fs
  .readdirSync(songsDir)
  .filter((name) => name.toLowerCase().endsWith('.mp3'))
  .sort((a, b) => a.localeCompare(b));

console.log(`Scanning ${mp3s.length} MP3s in Songs/ (min silence to trim: ${minSilence}s)${dryRun ? ' [dry run]' : ''}\n`);

let trimmed = 0;
let skipped = 0;

for (const name of mp3s) {
  const filePath = path.join(songsDir, name);
  const leading = detectLeadingSilence(filePath);

  if (leading < minSilence) {
    skipped += 1;
    continue;
  }

  console.log(`TRIM ${leading.toFixed(3)}s  ${name}`);

  if (!dryRun) {
    trimLeadingSilence(filePath);
    const after = detectLeadingSilence(filePath);
    console.log(`  -> after: ${after < 0.05 ? 'ok' : `${after.toFixed(3)}s remaining`}`);
    trimmed += 1;
  }
}

console.log(`\nDone. ${dryRun ? 'Would trim' : 'Trimmed'} ${dryRun ? mp3s.length - skipped : trimmed}, skipped ${skipped}.`);
