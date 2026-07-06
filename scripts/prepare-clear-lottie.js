/**
 * 本番 clear.json を React Native（特に iOS）向けに最適化する。
 *
 * - 埋め込みフォント base64（fPath）を除去 → パース失敗・巨大 JSON の回避
 * - テキストレイヤーのフォントを iOS システムフォントへ差し替え
 * - レイヤー名 "NaN" を修正
 *
 * Usage:
 *   node scripts/prepare-clear-lottie.js <入力.json> [出力.json]
 *
 * 例:
 *   node scripts/prepare-clear-lottie.js "C:/path/to/clear.json"
 */
const fs = require('fs');
const path = require('path');

const IOS_TEXT_FONT = 'Helvetica-Bold';

const args = process.argv.slice(2);
const shapesOnly = args.includes('--shapes-only');
const jsonArgs = args.filter((a) => a.endsWith('.json'));
const inputPath = jsonArgs[0];
const outputPath =
  jsonArgs[1] ?? path.join(__dirname, '..', 'assets', 'lottie', 'clear.json');

if (!inputPath) {
  console.error(
    'Usage: node scripts/prepare-clear-lottie.js [--shapes-only] <入力.json> [出力.json]',
  );
  process.exit(1);
}

if (!fs.existsSync(inputPath)) {
  console.error('Input not found:', inputPath);
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, 'utf8');
const data = JSON.parse(raw);
const beforeBytes = raw.length;

if (data.fonts?.list) {
  for (const font of data.fonts.list) {
    delete font.fPath;
    font.origin = 3;
    font.fFamily = font.fFamily || 'Helvetica';
    font.fStyle = font.fStyle || 'Bold';
  }
}

if (shapesOnly) {
  data.layers = (data.layers ?? []).filter((layer) => layer.ty === 4);
  delete data.fonts;
}

let textLayerIndex = 0;
for (const layer of data.layers ?? []) {
  if (layer.nm == null || layer.nm === 'NaN' || (typeof layer.nm === 'number' && Number.isNaN(layer.nm))) {
    layer.nm = layer.ty === 5 ? `Text_${textLayerIndex++}` : `Layer_${layer.ind ?? textLayerIndex}`;
  }

  if (layer.ty !== 5 || !layer.t?.d?.k) continue;

  for (const keyframe of layer.t.d.k) {
    if (keyframe.s?.f) {
      keyframe.s.f = IOS_TEXT_FONT;
    }
  }
}

const outDir = path.dirname(outputPath);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const output = JSON.stringify(data);
fs.writeFileSync(outputPath, output);

const shapeCount = data.layers.filter((l) => l.ty === 4).length;
const textCount = data.layers.filter((l) => l.ty === 5).length;
const solidCount = data.layers.filter((l) => l.ty === 1).length;

console.log('Prepared clear Lottie for mobile');
console.log('  input :', inputPath);
console.log('  output:', outputPath);
console.log('  nm    :', data.nm);
console.log('  size  :', `${beforeBytes} -> ${output.length} bytes`);
console.log('  layers:', `${shapeCount} shapes, ${textCount} text, ${solidCount} solids`);
console.log('  duration:', `${((data.op ?? 30) / (data.fr || 30)).toFixed(2)}s`);
