/**
 * プレースホルダー Lottie JSON を生成する。
 * lottie-react-native が解釈できる形式（shape は gr グループ必須）。
 *
 * Usage: node scripts/generate-placeholder-lottie.js
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'assets', 'lottie');

/** 入場演出の尺（秒） */
const ENTER_DURATION_SEC = 1;
const FPS = 30;
const ENTER_FRAMES = ENTER_DURATION_SEC * FPS;

function rgba(hex, alpha = 1) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return [r, g, b, alpha];
}

// lottie-ios は補間ハンドルを配列形式で期待する（スカラーだと iOS で描画失敗）
function keyframe(t, value) {
  return {
    t,
    s: value,
    i: { x: [0.42], y: [0] },
    o: { x: [0.58], y: [1] },
  };
}

function transform() {
  return {
    ty: 'tr',
    p: { a: 0, k: [0, 0] },
    a: { a: 0, k: [0, 0] },
    s: { a: 0, k: [100, 100] },
    r: { a: 0, k: 0 },
    o: { a: 0, k: 100 },
    sk: { a: 0, k: 0 },
    sa: { a: 0, k: 0 },
    nm: 'Transform',
  };
}

function ellipseGroup(name, color, size) {
  return {
    ty: 'gr',
    nm: name,
    np: 3,
    cix: 2,
    bm: 0,
    it: [
      {
        d: 1,
        ty: 'el',
        s: { a: 0, k: [size, size] },
        p: { a: 0, k: [0, 0] },
        nm: 'Ellipse',
      },
      {
        ty: 'fl',
        c: { a: 0, k: color },
        o: { a: 0, k: 100 },
        r: 1,
        bm: 0,
        nm: 'Fill',
      },
      transform(),
    ],
  };
}

function hexColor(hex) {
  return hex.startsWith('#') ? hex : `#${hex}`;
}

function solidLayer(index, name, colorHex, frames) {
  return {
    ddd: 0,
    ind: index,
    ty: 1,
    nm: name,
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [540, 960, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    sw: 1080,
    sh: 1920,
    sc: hexColor(colorHex),
    ip: 0,
    op: frames,
    st: 0,
    bm: 0,
  };
}

function blobLayer(index, name, color, startPos, endPos, startScale, endScale, frames) {
  const mergeAt = Math.round(frames * 0.72);
  const fadeAt = Math.max(mergeAt + 2, frames - 4);

  return {
    ddd: 0,
    ind: index,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          keyframe(0, [92]),
          keyframe(mergeAt, [100]),
          keyframe(frames, [0]),
        ],
      },
      r: { a: 0, k: 0 },
      p: {
        a: 1,
        k: [keyframe(0, [...startPos, 0]), keyframe(mergeAt, [...endPos, 0])],
      },
      a: { a: 0, k: [0, 0, 0] },
      s: {
        a: 1,
        k: [
          keyframe(0, [startScale, startScale, 100]),
          keyframe(mergeAt, [endScale, endScale, 100]),
        ],
      },
    },
    ao: 0,
    shapes: [ellipseGroup(name, color, 300)],
    ip: 0,
    op: frames,
    st: 0,
    bm: 0,
  };
}

function burstLayer(index, color, delay, frames) {
  return {
    ddd: 0,
    ind: index,
    ty: 4,
    nm: 'Burst',
    sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          keyframe(delay, [0]),
          keyframe(delay + 3, [85]),
          keyframe(frames, [0]),
        ],
      },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [540, 960, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: {
        a: 1,
        k: [
          keyframe(delay, [50, 50, 100]),
          keyframe(frames, [200, 200, 100]),
        ],
      },
    },
    ao: 0,
    shapes: [ellipseGroup('Burst', color, 360)],
    ip: delay,
    op: frames,
    st: delay,
    bm: 0,
  };
}

function makeComp(name, layers, durationFrames) {
  return {
    v: '5.7.4',
    fr: FPS,
    ip: 0,
    op: durationFrames,
    w: 1080,
    h: 1920,
    nm: name,
    ddd: 0,
    assets: [],
    layers,
  };
}

const BG = '#dbc9a8';
const CYAN = rgba('#48a8c8');
const MAGENTA = rgba('#c84878');
const YELLOW = rgba('#e8b818');
const WARM = rgba('#c48820');
const SUCCESS = rgba('#6a9048');

function simpleFade(name, accentColor, frames = 30) {
  return makeComp(name, [burstLayer(2, accentColor, Math.round(frames * 0.25), frames)], frames);
}

function enterPaintMix() {
  const frames = ENTER_FRAMES;
  const burstAt = Math.round(frames * 0.7);
  return makeComp('enter-paint-mix', [
    blobLayer(2, 'Cyan', CYAN, [160, 500], [540, 900], 75, 125, frames),
    blobLayer(3, 'Magenta', MAGENTA, [920, 580], [540, 900], 70, 120, frames),
    blobLayer(4, 'Yellow', YELLOW, [540, 1420], [540, 900], 80, 130, frames),
    burstLayer(5, WARM, burstAt, frames),
  ], frames);
}

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const files = {
  'clear.json': simpleFade('clear-glow', SUCCESS),
  'exit.json': simpleFade('exit-fade', rgba('#8a7058')),
};

for (const [file, data] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT_DIR, file), JSON.stringify(data));
  console.log('wrote', file, `(${file === 'enter.json' ? `${ENTER_DURATION_SEC}s` : '1s'})`);
}
