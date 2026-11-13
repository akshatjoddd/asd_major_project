
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const folder = resolve(here, '../src/i18n');

const read = (name) => JSON.parse(readFileSync(resolve(folder, `${name}.json`), 'utf8'));

function flatten(value, prefix = '', out = []) {
  Object.entries(value).forEach(([key, entry]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) flatten(entry, path, out);
    else out.push(path);
  });
  return out;
}

const en = new Set(flatten(read('en')));
const hi = new Set(flatten(read('hi')));

const missingInHi = [...en].filter((key) => !hi.has(key));
const missingInEn = [...hi].filter((key) => !en.has(key));
const interpolations = [...en].filter((key) => key);

const placeholdersOf = (text) => (String(text).match(/\{\{\s*\w+\s*\}\}/g) || []).sort().join(',');
const pick = (object, path) => path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), object);
const enJson = read('en');
const hiJson = read('hi');
const mismatched = interpolations.filter(
  (key) => placeholdersOf(pick(enJson, key)) !== placeholdersOf(pick(hiJson, key)),
);

let failed = false;
const report = (label, rows) => {
  if (!rows.length) return;
  failed = true;
  console.error(`${label} (${rows.length}):`);
  rows.forEach((row) => console.error(`  - ${row}`));
};

report('Missing in hi.json', missingInHi);
report('Missing in en.json', missingInEn);
report('Interpolation mismatch', mismatched);

if (failed) {
  console.error('\ni18n check failed.');
  process.exit(1);
}

console.log(`i18n check passed: ${en.size} keys in both languages.`);
