/**
 * 本番 clear 演出に近い軽量 Lottie JSON を生成する。
 * - shape のみ（テキスト・フォントなし）
 * - gr グループ必須（lottie-react-native iOS 互換）
 *
 * Usage: node scripts/generate-clear-lottie.js
 */
const fs = require('fs');
const path = require('path');

const OUT_PATH = path.join(__dirname, '..', 'assets', 'lottie', 'clear.json');
const FPS = 30;
const FRAMES = 86;
const W = 1080;
const H = 1920;
const TEXT_Y = 900;
const TEXT_CENTER = [540, TEXT_Y];

function rgba(hex, alpha = 1) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
    alpha,
  ];
}

function keyframe(t, value) {
  return {
    t,
    s: value,
    i: { x: [0.42], y: [0] },
    o: { x: [0.58], y: [1] },
  };
}

function popKeyframe(t, value) {
  return {
    t,
    s: value,
    i: { x: [0.22], y: [0.61] },
    o: { x: [0.36], y: [1] },
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

function pixelGroup(name, color, rows, pixel = 11, gap = 1) {
  const items = [];
  const step = pixel + gap;
  for (let row = 0; row < rows.length; row++) {
    for (let col = 0; col < rows[row].length; col++) {
      if (rows[row][col] !== '#') continue;
      items.push({
        d: 1,
        ty: 'rc',
        s: { a: 0, k: [pixel, pixel] },
        p: { a: 0, k: [col * step, row * step] },
        r: { a: 0, k: 2 },
        nm: 'Pixel',
      });
    }
  }
  items.push({
    ty: 'fl',
    c: { a: 0, k: color },
    o: { a: 0, k: 100 },
    r: 1,
    bm: 0,
    nm: 'Fill',
  });
  items.push({
    ty: 'st',
    lc: 2,
    lj: 2,
    bm: 0,
    nm: 'Stroke',
    o: { a: 0, k: 100 },
    w: { a: 0, k: 4 },
    c: { a: 0, k: [0, 0, 0, 1] },
  });
  items.push(transform());
  return {
    ty: 'gr',
    nm: name,
    np: items.length,
    cix: 2,
    bm: 0,
    it: items,
  };
}

function ellipseGroup(name, color, width, height = width) {
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
        s: { a: 0, k: [width, height] },
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

const LETTERS = [
  {
    name: 'Letter_S',
    rows: ['.####.', '#.....', '.###..', '....#.', '#####.'],
    color: rgba('#48a8c8'),
    pos: [257, TEXT_Y],
    pop: 17,
  },
  {
    name: 'Letter_T',
    rows: ['#####.', '..##..', '..##..', '..##..', '..##..'],
    color: rgba('#c84878'),
    pos: [314, TEXT_Y],
    pop: 20,
  },
  {
    name: 'Letter_A',
    rows: ['.###..', '#...#.', '#####.', '#...#.', '#...#.'],
    color: rgba('#e8b818'),
    pos: [373, TEXT_Y],
    pop: 23,
  },
  {
    name: 'Letter_G',
    rows: ['.####.', '#.....', '#..##.', '#...#.', '.###..'],
    color: rgba('#78c850'),
    pos: [437, TEXT_Y],
    pop: 26,
  },
  {
    name: 'Letter_E',
    rows: ['#####.', '#.....', '####..', '#.....', '#####.'],
    color: rgba('#dc783c'),
    pos: [498, TEXT_Y],
    pop: 29,
  },
  {
    name: 'Letter_C',
    rows: ['.####.', '#.....', '#.....', '#.....', '.####.'],
    color: rgba('#a050c8'),
    pos: [596, TEXT_Y],
    pop: 32,
  },
  {
    name: 'Letter_L',
    rows: ['#.....', '#.....', '#.....', '#.....', '#####.'],
    color: rgba('#3cb4c8'),
    pos: [654, TEXT_Y],
    pop: 35,
  },
  {
    name: 'Letter_E2',
    rows: ['#####.', '#.....', '####..', '#.....', '#####.'],
    color: rgba('#e8b818'),
    pos: [706, TEXT_Y],
    pop: 38,
  },
  {
    name: 'Letter_A2',
    rows: ['.###..', '#...#.', '#####.', '#...#.', '#...#.'],
    color: rgba('#48a8c8'),
    pos: [763, TEXT_Y],
    pop: 41,
  },
  {
    name: 'Letter_R',
    rows: ['####..', '#...#.', '####..', '#.#...', '#..##.'],
    color: rgba('#c84878'),
    pos: [826, TEXT_Y],
    pop: 44,
  },
];

/** 画面外から文字周辺へ集まるパーティクル */
const IN_PARTICLES = [
  { start: [951, -50], end: [814, 880], arrive: 32, size: 48, color: rgba('#dc783c') },
  { start: [-50, 1501], end: [799, 880], arrive: 34, size: 14, color: rgba('#78c850') },
  { start: [778, 1970], end: [706, 880], arrive: 30, size: 52, color: rgba('#e8b818') },
  { start: [1130, 1213], end: [618, 880], arrive: 28, size: 18, color: rgba('#c84878') },
  { start: [605, -50], end: [608, 880], arrive: 24, size: 56, color: rgba('#48a8c8') },
  { start: [-50, 925], end: [474, 880], arrive: 21, size: 20, color: rgba('#dc508c') },
  { start: [432, 1970], end: [461, 880], arrive: 18, size: 62, color: rgba('#64c8b4') },
  { start: [1130, 637], end: [361, 880], arrive: 15, size: 24, color: rgba('#b46496') },
  { start: [260, -50], end: [350, 880], arrive: 11, size: 8, color: rgba('#f0a050') },
  { start: [-50, 349], end: [257, 880], arrive: 8, size: 30, color: rgba('#3cb4c8') },
  { start: [874, -50], end: [682, 880], arrive: 30, size: 12, color: rgba('#78c850') },
  { start: [-50, 1373], end: [678, 880], arrive: 27, size: 38, color: rgba('#e8b818') },
];

/** 文字完成後に中央から弾けるパーティクル */
const OUT_PARTICLES = [
  { angle: 0, dist: 380, size: 24, color: rgba('#e8b818'), delay: 42 },
  { angle: 45, dist: 350, size: 16, color: rgba('#c84878'), delay: 42 },
  { angle: 90, dist: 400, size: 28, color: rgba('#78c850'), delay: 43 },
  { angle: 135, dist: 360, size: 14, color: rgba('#dc783c'), delay: 44 },
  { angle: 180, dist: 390, size: 20, color: rgba('#f0a050'), delay: 42 },
  { angle: 225, dist: 340, size: 26, color: rgba('#3cb4c8'), delay: 44 },
  { angle: 270, dist: 410, size: 18, color: rgba('#dc508c'), delay: 43 },
  { angle: 315, dist: 370, size: 22, color: rgba('#a050c8'), delay: 42 },
];

/** 各文字ポップ時のスパークル */
const SPARKS = LETTERS.map((letter) => ({
  pos: letter.pos,
  frame: letter.pop,
  color: letter.color,
}));

function letterMetrics(rows, pixel = 11, gap = 1) {
  const step = pixel + gap;
  const cols = Math.max(...rows.map((row) => row.length));
  const height = rows.length * step - gap;
  const width = cols * step - gap;
  return { width, height, anchor: [width / 2, height / 2] };
}

function letterLayer(index, letter) {
  const fadeIn = letter.pop + 5;
  const bounce = letter.pop + 2;
  const exitStart = 68;
  const exitX = letter.pos[0] + 360;
  const metrics = letterMetrics(letter.rows);
  const tilt = letter.name.endsWith('R') ? 8 : letter.name.endsWith('S') ? -6 : 5;

  return {
    ddd: 0,
    ind: index,
    ty: 4,
    nm: letter.name,
    sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          keyframe(letter.pop, [0]),
          keyframe(fadeIn, [100]),
          keyframe(exitStart, [100]),
          keyframe(FRAMES, [0]),
        ],
      },
      r: {
        a: 1,
        k: [
          keyframe(letter.pop - 5, [0]),
          popKeyframe(letter.pop, [tilt]),
          popKeyframe(bounce, [-tilt * 0.4]),
          keyframe(letter.pop + 6, [0]),
          keyframe(exitStart, [0]),
          keyframe(FRAMES, [0]),
        ],
      },
      p: {
        a: 1,
        k: [
          keyframe(0, [...letter.pos, 0]),
          popKeyframe(letter.pop - 4, [letter.pos[0], letter.pos[1] + 18, 0]),
          popKeyframe(letter.pop, [...letter.pos, 0]),
          keyframe(exitStart, [...letter.pos, 0]),
          keyframe(FRAMES, [exitX, letter.pos[1] - 8, 0]),
        ],
      },
      a: { a: 0, k: [...metrics.anchor, 0] },
      s: {
        a: 1,
        k: [
          keyframe(letter.pop - 7, [170, 170, 100]),
          popKeyframe(letter.pop, [94, 106, 100]),
          popKeyframe(bounce, [103, 97, 100]),
          keyframe(letter.pop + 6, [100, 100, 100]),
          keyframe(exitStart, [100, 100, 100]),
          keyframe(FRAMES, [92, 92, 100]),
        ],
      },
    },
    ao: 0,
    shapes: [pixelGroup(letter.name, letter.color, letter.rows)],
    ip: 0,
    op: FRAMES,
    st: 0,
    bm: 0,
  };
}

function glowLayer(index, name, color, width, height, pos, start, peak, end, peakOpacity, scaleKeyframes) {
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
          keyframe(start, [0]),
          keyframe(peak, [peakOpacity]),
          keyframe(end, [0]),
        ],
      },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [...pos, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: scaleKeyframes
        ? { a: 1, k: scaleKeyframes }
        : { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    shapes: [ellipseGroup(name, color, width, height)],
    ip: start,
    op: end + 2,
    st: start,
    bm: 0,
  };
}

function burstRingLayer(index, name, color, start, peakOpacity = 55) {
  return glowLayer(
    index,
    name,
    color,
    120,
    120,
    TEXT_CENTER,
    start,
    start + 6,
    start + 14,
    peakOpacity,
    [
      keyframe(start, [40, 40, 100]),
      keyframe(start + 14, [280, 280, 100]),
    ],
  );
}

function flashLayer(index) {
  return {
    ddd: 0,
    ind: index,
    ty: 4,
    nm: 'Flash',
    sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          keyframe(42, [0]),
          keyframe(44, [28]),
          keyframe(48, [0]),
        ],
      },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [...TEXT_CENTER, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: {
        a: 1,
        k: [
          keyframe(42, [75, 75, 100]),
          keyframe(48, [190, 190, 100]),
        ],
      },
    },
    ao: 0,
    shapes: [ellipseGroup('Flash', rgba('#fff8d2'), 840, 250)],
    ip: 42,
    op: 50,
    st: 42,
    bm: 0,
  };
}

function inParticleLayer(index, particle, name) {
  const shrink = 44;
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
          keyframe(0, [0]),
          keyframe(2, [100]),
          keyframe(particle.arrive, [100]),
          keyframe(shrink, [0]),
        ],
      },
      r: { a: 0, k: 0 },
      p: {
        a: 1,
        k: [
          keyframe(0, [...particle.start, 0]),
          keyframe(particle.arrive, [...particle.end, 0]),
        ],
      },
      a: { a: 0, k: [0, 0, 0] },
      s: {
        a: 1,
        k: [
          keyframe(0, [40, 40, 100]),
          keyframe(particle.arrive, [110, 110, 100]),
          keyframe(shrink, [10, 10, 100]),
        ],
      },
    },
    ao: 0,
    shapes: [ellipseGroup(name, particle.color, particle.size)],
    ip: 0,
    op: 48,
    st: 0,
    bm: 0,
  };
}

function outParticleLayer(index, particle, name) {
  const rad = (particle.angle * Math.PI) / 180;
  const endX = TEXT_CENTER[0] + Math.cos(rad) * particle.dist;
  const endY = TEXT_CENTER[1] + Math.sin(rad) * particle.dist;
  const start = particle.delay;
  const end = start + 10;

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
          keyframe(start, [0]),
          keyframe(start + 2, [100]),
          keyframe(end, [0]),
        ],
      },
      r: { a: 0, k: 0 },
      p: {
        a: 1,
        k: [
          keyframe(start, [...TEXT_CENTER, 0]),
          keyframe(end, [endX, endY, 0]),
        ],
      },
      a: { a: 0, k: [0, 0, 0] },
      s: {
        a: 1,
        k: [
          keyframe(start, [30, 30, 100]),
          keyframe(start + 3, [120, 120, 100]),
          keyframe(end, [40, 40, 100]),
        ],
      },
    },
    ao: 0,
    shapes: [ellipseGroup(name, particle.color, particle.size)],
    ip: start,
    op: end + 2,
    st: start,
    bm: 0,
  };
}

function sparkLayer(index, spark, name) {
  const start = spark.frame;
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
          keyframe(start, [0]),
          keyframe(start + 2, [100]),
          keyframe(start + 8, [0]),
        ],
      },
      r: {
        a: 1,
        k: [
          keyframe(start, [0]),
          keyframe(start + 8, [45]),
        ],
      },
      p: { a: 0, k: [...spark.pos, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: {
        a: 1,
        k: [
          keyframe(start, [60, 60, 100]),
          keyframe(start + 8, [140, 140, 100]),
        ],
      },
    },
    ao: 0,
    shapes: [ellipseGroup(name, spark.color, 36)],
    ip: start,
    op: start + 10,
    st: start,
    bm: 0,
  };
}

function buildClearLottie() {
  const layers = [];
  let ind = 1;

  for (let i = LETTERS.length - 1; i >= 0; i--) {
    layers.push(letterLayer(ind++, LETTERS[i]));
  }

  for (let i = SPARKS.length - 1; i >= 0; i--) {
    layers.push(sparkLayer(ind++, SPARKS[i], `Spark_${i + 1}`));
  }

  layers.push(flashLayer(ind++));

  layers.push(
    glowLayer(ind++, 'TextGlow', rgba('#fff8d2'), 820, 140, TEXT_CENTER, 18, 30, 46, 42, [
      keyframe(18, [88, 88, 100]),
      keyframe(30, [106, 106, 100]),
      keyframe(46, [94, 94, 100]),
    ]),
  );

  layers.push(
    glowLayer(ind++, 'TextGlowOuter', rgba('#fff8d2', 0.55), 980, 200, TEXT_CENTER, 20, 32, 50, 24, [
      keyframe(20, [75, 75, 100]),
      keyframe(32, [112, 112, 100]),
      keyframe(50, [88, 88, 100]),
    ]),
  );

  layers.push(burstRingLayer(ind++, 'BurstRing1', rgba('#e8b818', 0.7), 14, 42));
  layers.push(burstRingLayer(ind++, 'BurstRing2', rgba('#48a8c8', 0.55), 42, 52));

  for (let i = 0; i < OUT_PARTICLES.length; i++) {
    layers.push(outParticleLayer(ind++, OUT_PARTICLES[i], `Out_${i + 1}`));
  }

  for (let i = 0; i < IN_PARTICLES.length; i++) {
    layers.push(inParticleLayer(ind++, IN_PARTICLES[i], `P_${i + 1}`));
  }

  return {
    v: '5.7.4',
    fr: FPS,
    ip: 0,
    op: FRAMES,
    w: W,
    h: H,
    nm: 'stage-clear',
    ddd: 0,
    assets: [],
    layers,
  };
}

const data = buildClearLottie();
const json = JSON.stringify(data);
fs.writeFileSync(OUT_PATH, json);

const shapeLayers = data.layers.filter((l) => l.ty === 4).length;
console.log('Generated clear Lottie (enhanced)');
console.log('  output:', OUT_PATH);
console.log('  bytes :', json.length);
console.log('  layers:', shapeLayers);
console.log('  duration:', `${(FRAMES / FPS).toFixed(2)}s`);
