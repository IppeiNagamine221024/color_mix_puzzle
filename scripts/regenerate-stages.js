/**
 * ステージ 32〜100 を再生成するスクリプト（1〜31 は現状維持）。
 *
 * 設計方針（docs/requirements の考え方に準拠）:
 *  - 難易度スコア = 必要ブロック総数(=混色量) + セル数 + 形状複雑度 + お邪魔数*4
 *    をグループ内でソートして緩やかに上昇させる。
 *  - 32〜60: お邪魔ブロックなし / 61〜100: お邪魔ブロック出現可。
 *  - 形状は横三列(H3)/L/T/S/Z/十字など、最大 3x3。
 *  - 初期配置ブロックは三原色のみ、色は colors.json のみ、課題パターンは重複禁止。
 *
 * 実行: node scripts/regenerate-stages.js
 */
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'assets', 'data');
const stagesPath = path.join(dataDir, 'stages.json');
const colorsPath = path.join(dataDir, 'colors.json');

const colors = JSON.parse(fs.readFileSync(colorsPath, 'utf8'));
const existing = JSON.parse(fs.readFileSync(stagesPath, 'utf8'));

/** color id -> ratio[3] */
const RATIO = {};
for (const c of colors) RATIO[c.id] = c.ratio;

const PRIMARIES = new Set(
  colors.filter((c) => c.ratio.reduce((a, b) => a + b, 0) === 1).map((c) => c.id),
);

/** 1ブロック分の色を作るのに必要な原色数（=混色の重さ） */
function blockCost(colorId) {
  const r = RATIO[colorId];
  if (!r) throw new Error(`未知の色: ${colorId}`);
  return r[0] + r[1] + r[2];
}

/** 形状定義: 相対座標(最大3x3)と複雑度スコア */
const SHAPES = {
  H2: { cells: [[0, 0], [1, 0]], score: 0 },
  V2: { cells: [[0, 0], [0, 1]], score: 0 },
  D2: { cells: [[0, 0], [1, 1]], score: 1 },
  AD2: { cells: [[1, 0], [0, 1]], score: 1 },
  H3: { cells: [[0, 0], [1, 0], [2, 0]], score: 2 },
  V3: { cells: [[0, 0], [0, 1], [0, 2]], score: 2 },
  D3: { cells: [[0, 0], [1, 1], [2, 2]], score: 3 },
  L3a: { cells: [[0, 0], [0, 1], [1, 1]], score: 2 },
  L3b: { cells: [[0, 0], [1, 0], [1, 1]], score: 2 },
  L3c: { cells: [[0, 0], [1, 0], [0, 1]], score: 2 },
  L3d: { cells: [[1, 0], [0, 1], [1, 1]], score: 2 },
  T4: { cells: [[0, 0], [1, 0], [2, 0], [1, 1]], score: 4 },
  Tu: { cells: [[1, 0], [0, 1], [1, 1], [2, 1]], score: 4 },
  S4: { cells: [[1, 0], [2, 0], [0, 1], [1, 1]], score: 4 },
  Z4: { cells: [[0, 0], [1, 0], [1, 1], [2, 1]], score: 4 },
  Sq4: { cells: [[0, 0], [1, 0], [0, 1], [1, 1]], score: 4 },
  L4a: { cells: [[0, 0], [0, 1], [0, 2], [1, 2]], score: 4 },
  L4b: { cells: [[0, 0], [1, 0], [2, 0], [2, 1]], score: 4 },
  T5: { cells: [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]], score: 6 },
  Plus5: { cells: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]], score: 6 },
  S5: { cells: [[1, 0], [2, 0], [0, 1], [1, 1], [0, 2]], score: 6 },
  U5: { cells: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]], score: 6 },
  C6: { cells: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], score: 8 },
};

// グループA: ステージ 32〜60（お邪魔なし・4x4）
const groupA = [
  ['H2', ['green', 'red']],
  ['H2', ['blue', 'red']],
  ['V2', ['red', 'blue']],
  ['V2', ['green', 'blue']],
  ['D2', ['green', 'blue']],
  ['D2', ['red', 'green']],
  ['AD2', ['blue', 'red']],
  ['H2', ['orange', 'green']],
  ['V2', ['teal', 'red']],
  ['H2', ['purple', 'yellow']],
  ['V2', ['blue', 'wine']],
  ['AD2', ['sky', 'red']],
  ['D2', ['orange', 'blue']],
  ['V2', ['purple', 'chartreuse']],
  ['L3c', ['cyan', 'magenta', 'yellow']],
  ['L3a', ['green', 'yellow', 'magenta']],
  ['L3d', ['yellow', 'cyan', 'red']],
  ['L3b', ['blue', 'green', 'red']],
  ['H3', ['cyan', 'green', 'yellow']],
  ['V3', ['magenta', 'purple', 'blue']],
  ['H3', ['red', 'green', 'blue']],
  ['D3', ['cyan', 'magenta', 'yellow']],
  ['T4', ['cyan', 'magenta', 'yellow', 'red']],
  ['Sq4', ['cyan', 'magenta', 'yellow', 'red']],
  ['S4', ['magenta', 'yellow', 'cyan', 'green']],
  ['Z4', ['green', 'yellow', 'magenta', 'red']],
  ['Tu', ['red', 'cyan', 'green', 'magenta']],
  ['L4a', ['cyan', 'green', 'red', 'yellow']],
  ['H3', ['orange', 'yellow', 'red']],
];

// グループB: ステージ 61〜100（お邪魔可・5x5）。3要素目はお邪魔数。
const groupB = [
  ['L3a', ['teal', 'sky', 'red'], 0],
  ['V3', ['blue', 'sky', 'cyan'], 0],
  ['H3', ['teal', 'green', 'chartreuse'], 0],
  ['D3', ['blue', 'green', 'red'], 0],
  ['T4', ['cyan', 'magenta', 'yellow', 'green'], 1],
  ['S4', ['red', 'orange', 'cyan', 'green'], 1],
  ['Z4', ['blue', 'purple', 'magenta', 'red'], 1],
  ['Sq4', ['green', 'red', 'blue', 'purple'], 1],
  ['L4b', ['cyan', 'green', 'yellow', 'orange'], 1],
  ['Tu', ['wine', 'red', 'magenta', 'yellow'], 1],
  ['V3', ['chartreuse', 'green', 'yellow'], 1],
  ['H3', ['purple', 'blue', 'sky'], 1],
  ['T4', ['orange', 'red', 'wine', 'magenta'], 1],
  ['S4', ['green', 'teal', 'cyan', 'blue'], 1],
  ['L4a', ['magenta', 'purple', 'blue', 'cyan'], 1],
  ['D3', ['orange', 'purple', 'teal'], 1],
  ['Z4', ['green', 'chartreuse', 'yellow', 'orange'], 1],
  ['Sq4', ['red', 'orange', 'wine', 'vermillion'], 2],
  ['T4', ['cyan', 'blue', 'magenta', 'purple'], 1],
  ['V3', ['orange', 'red', 'magenta'], 1],
  ['L4a', ['red', 'orange', 'amber', 'yellow'], 2],
  ['S4', ['teal', 'sky', 'magenta', 'blue'], 2],
  ['H3', ['spring', 'chartreuse', 'green'], 2],
  ['T5', ['cyan', 'magenta', 'yellow', 'red', 'green'], 2],
  ['Plus5', ['magenta', 'cyan', 'black', 'yellow', 'red'], 2],
  ['S4', ['amber', 'orange', 'red', 'magenta'], 2],
  ['Z4', ['wine', 'burgundy', 'magenta', 'indigo'], 2],
  ['T4', ['olive', 'green', 'purple', 'yellow'], 2],
  ['L4a', ['blue', 'purple', 'indigo', 'magenta'], 2],
  ['U5', ['green', 'red', 'blue', 'purple', 'orange'], 2],
  ['S5', ['cyan', 'green', 'magenta', 'blue', 'purple'], 2],
  ['T5', ['red', 'orange', 'amber', 'magenta', 'wine'], 3],
  ['Sq4', ['purple', 'blue', 'lavender', 'violet'], 3],
  ['V3', ['amber', 'orange', 'red'], 2],
  ['Plus5', ['magenta', 'blue', 'black', 'red', 'yellow'], 3],
  ['T5', ['green', 'chartreuse', 'spring', 'yellow', 'cyan'], 3],
  ['S5', ['purple', 'indigo', 'blue', 'sky', 'cyan'], 3],
  ['Z4', ['teal', 'sky', 'blue', 'navy'], 3],
  ['U5', ['orange', 'amber', 'red', 'vermillion', 'magenta'], 3],
  ['C6', ['black', 'red', 'green', 'blue', 'yellow', 'magenta'], 3],
];

const OBSTACLE_POOL = [
  [2, 2],
  [1, 3],
  [3, 3],
  [2, 4],
];
const INIT_PRIMARIES = ['cyan', 'magenta', 'yellow'];

function buildCells(shapeName, colorList) {
  const shape = SHAPES[shapeName];
  if (!shape) throw new Error(`未知の形状: ${shapeName}`);
  if (shape.cells.length !== colorList.length) {
    throw new Error(`形状 ${shapeName} は ${shape.cells.length} 色必要ですが ${colorList.length} 色指定されました`);
  }
  return shape.cells.map(([dx, dy], i) => ({ dx, dy, color: colorList[i] }));
}

function patternSignature(cells) {
  return cells
    .map((c) => `${c.dx},${c.dy}:${c.color}`)
    .sort()
    .join('|');
}

// 既存 1〜31 のパターン署名を収集（重複禁止のため）
const seen = new Set();
for (const s of existing) {
  if (s.id <= 31) seen.add(patternSignature(s.pattern.cells));
}

function makeStage(id, shapeName, colorList, obstacleCount, tier, boardW, boardH) {
  const cells = buildCells(shapeName, colorList);

  // 検証: 色の存在
  for (const c of cells) {
    if (!RATIO[c.color]) throw new Error(`stage ${id}: 未知の色 ${c.color}`);
  }
  // 検証: bbox <= 3x3
  const maxDx = Math.max(...cells.map((c) => c.dx));
  const maxDy = Math.max(...cells.map((c) => c.dy));
  if (maxDx > 2 || maxDy > 2) throw new Error(`stage ${id}: パターンが3x3を超過`);

  // 検証: パターン重複
  const sig = patternSignature(cells);
  if (seen.has(sig)) throw new Error(`stage ${id}: パターン重複 ${sig}`);
  seen.add(sig);

  // 初期配置（三原色のみ）
  const initialBlocks = [
    { x: 0, y: 0, color: INIT_PRIMARIES[id % 3] },
    { x: boardW - 1, y: 0, color: INIT_PRIMARIES[(id + 1) % 3] },
  ];
  if (obstacleCount >= 2) {
    initialBlocks.push({ x: Math.floor(boardW / 2), y: 0, color: INIT_PRIMARIES[(id + 2) % 3] });
  }
  for (const b of initialBlocks) {
    if (!PRIMARIES.has(b.color)) throw new Error(`stage ${id}: 初期ブロックが原色でない`);
  }

  // お邪魔ブロック
  const obstacles = [];
  for (let i = 0; i < obstacleCount; i++) {
    const [x, y] = OBSTACLE_POOL[i];
    obstacles.push({ x, y });
  }

  // par / maxTurns
  const blockSum = cells.reduce((sum, c) => sum + blockCost(c.color), 0);
  const par = Math.max(3, blockSum);
  let maxTurns =
    par + 6 + obstacleCount * 2 + Math.max(0, cells.length - 2) * 2;
  maxTurns = Math.min(maxTurns, 28);

  return {
    id,
    name: `ステージ ${id}`,
    board: { width: boardW, height: boardH },
    obstacles,
    initialBlocks,
    pattern: { cells },
    maxTurns,
    next: { initial: INIT_PRIMARIES[(id + 2) % 3] },
    spawn: { mode: 'random' },
    metadata: { difficulty: tier, par, isTutorial: false },
  };
}

function difficultyScore(shapeName, colorList, obstacleCount) {
  const shape = SHAPES[shapeName];
  const blockSum = colorList.reduce((s, c) => s + blockCost(c), 0);
  return blockSum + colorList.length + shape.score + obstacleCount * 4;
}

// グループAをスコア昇順に並べ 32〜60 へ
const sortedA = [...groupA]
  .map((s) => ({ s, score: difficultyScore(s[0], s[1], 0) }))
  .sort((a, b) => a.score - b.score)
  .map((x) => x.s);

// グループBをスコア昇順に並べ 61〜100 へ
const sortedB = [...groupB]
  .map((s) => ({ s, score: difficultyScore(s[0], s[1], s[2]) }))
  .sort((a, b) => a.score - b.score)
  .map((x) => x.s);

const rebuilt = existing.filter((s) => s.id <= 31);

sortedA.forEach((spec, i) => {
  const id = 32 + i;
  const tier = id <= 45 ? 2 : 3;
  rebuilt.push(makeStage(id, spec[0], spec[1], 0, tier, 4, 4));
});

sortedB.forEach((spec, i) => {
  const id = 61 + i;
  const tier = id <= 80 ? 4 : 5;
  rebuilt.push(makeStage(id, spec[0], spec[1], spec[2], tier, 5, 5));
});

rebuilt.sort((a, b) => a.id - b.id);

if (rebuilt.length !== 100) {
  throw new Error(`ステージ数が100ではありません: ${rebuilt.length}`);
}

fs.writeFileSync(stagesPath, JSON.stringify(rebuilt, null, 2) + '\n', 'utf8');

// サマリ出力
console.log('id\ttier\tcells\tpar\tturns\tobst\tshape');
for (const s of rebuilt) {
  if (s.id < 32) continue;
  console.log(
    `${s.id}\t${s.metadata.difficulty}\t${s.pattern.cells.length}\t${s.metadata.par}\t${s.maxTurns}\t${s.obstacles.length}\t${s.pattern.cells.map((c) => c.color).join(',')}`,
  );
}
console.log(`\nWrote ${rebuilt.length} stages to ${stagesPath}`);
