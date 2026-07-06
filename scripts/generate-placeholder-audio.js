/**
 * プレースホルダー WAV を生成する。
 * 本番音源は assets/audio/ 内の同名ファイルを差し替えるだけで OK。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'assets', 'audio');

function createWav(durationMs, frequencyHz = 0) {
  const sampleRate = 22050;
  const numSamples = Math.max(1, Math.floor((sampleRate * durationMs) / 1000));
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample =
      frequencyHz > 0
        ? Math.sin(2 * Math.PI * frequencyHz * t) * 0.15
        : 0;
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  return buffer;
}

const files = [
  { dir: 'bgm', name: 'greenpark.mp3', ms: 3000, hz: 220 },
  { dir: 'bgm', name: 'game.wav', ms: 3000, hz: 330 },
  { dir: 'se', name: 'stage_select.wav', ms: 120, hz: 520 },
  { dir: 'se', name: 'slide.wav', ms: 90, hz: 180 },
  { dir: 'se', name: 'mix.wav', ms: 140, hz: 440 },
  { dir: 'se', name: 'swap.wav', ms: 100, hz: 360 },
  { dir: 'se', name: 'clear.wav', ms: 500, hz: 660 },
  { dir: 'se', name: 'gameover.wav', ms: 400, hz: 110 },
  { dir: 'se', name: 'invalid.wav', ms: 80, hz: 90 },
  { dir: 'se', name: 'ui_tap.wav', ms: 60, hz: 600 },
  { dir: 'se', name: 'continue.wav', ms: 100, hz: 480 },
];

for (const file of files) {
  const dir = path.join(ROOT, file.dir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, file.name), createWav(file.ms, file.hz));
}

console.log(`Generated ${files.length} placeholder WAV files in assets/audio/`);
