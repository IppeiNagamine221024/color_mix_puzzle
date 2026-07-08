/**
 * 本番 clear.json（clear.production.json）を assets/lottie/clear.json に戻す。
 *
 * Usage: node scripts/restore-clear-production-lottie.js
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'assets', 'lottie');
const PRODUCTION = path.join(OUT_DIR, 'clear.production.json');
const CLEAR = path.join(OUT_DIR, 'clear.json');

if (!fs.existsSync(PRODUCTION)) {
  console.error('Missing backup:', PRODUCTION);
  console.error('Place your production clear.json there, or run prepare-clear-lottie.js first.');
  process.exit(1);
}

fs.copyFileSync(PRODUCTION, CLEAR);
const bytes = fs.statSync(CLEAR).size;
console.log('Restored clear.json from clear.production.json');
console.log('  size:', bytes, 'bytes');
