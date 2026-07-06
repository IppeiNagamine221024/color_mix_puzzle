const fs = require('fs');
const path = require('path');

const stages = [];

const stage1 = {
  id: 1,
  name: 'はじめの一歩',
  board: { width: 4, height: 3 },
  obstacles: [],
  initialBlocks: [{ x: 2, y: 1, color: 'cyan' }],
  pattern: {
    cells: [
      { dx: 0, dy: 0, color: 'cyan' },
      { dx: 1, dy: 0, color: 'magenta' },
    ],
  },
  maxTurns: 10,
  next: { initial: 'magenta' },
  spawn: { mode: 'random' },
  metadata: { difficulty: 1, par: 1, isTutorial: true },
};
stages.push(stage1);

const patterns = [
  {
    cells: [
      { dx: 0, dy: 0, color: 'yellow' },
      { dx: 1, dy: 0, color: 'magenta' },
    ],
    blocks: [{ x: 0, y: 1, color: 'yellow' }],
    next: 'magenta',
  },
  {
    cells: [
      { dx: 0, dy: 0, color: 'cyan' },
      { dx: 1, dy: 0, color: 'yellow' },
    ],
    blocks: [{ x: 2, y: 1, color: 'cyan' }],
    next: 'yellow',
  },
  {
    cells: [
      { dx: 0, dy: 0, color: 'magenta' },
      { dx: 1, dy: 0, color: 'yellow' },
    ],
    blocks: [{ x: 1, y: 2, color: 'magenta' }],
    next: 'yellow',
  },
  {
    cells: [
      { dx: 0, dy: 0, color: 'cyan' },
      { dx: 1, dy: 0, color: 'magenta' },
    ],
    blocks: [
      { x: 0, y: 0, color: 'cyan' },
      { x: 2, y: 0, color: 'yellow' },
    ],
    next: 'magenta',
  },
];

for (let id = 2; id <= 5; id++) {
  const p = patterns[id - 2];
  stages.push({
    id,
    name: `チュートリアル ${id}`,
    board: { width: 4, height: 3 },
    obstacles: [],
    initialBlocks: p.blocks,
    pattern: { cells: p.cells },
    maxTurns: 12,
    next: { initial: p.next },
    spawn: { mode: 'random' },
    metadata: { difficulty: 1, par: 3, isTutorial: true },
  });
}

for (let id = 6; id <= 100; id++) {
  const tier = id <= 25 ? 1 : id <= 60 ? 2 : id <= 90 ? 3 : 4;
  const width = tier >= 3 ? 5 : 4;
  const height = tier >= 4 ? 5 : tier >= 2 ? 4 : 3;
  const obstacleCount = tier >= 4 ? 2 : tier >= 3 ? 1 : 0;
  const par = 2 + Math.floor((id - 6) / 8) + tier;
  const maxTurns = Math.max(par + 4, Math.floor(par * 2));

  const obstacles = [];
  for (let i = 0; i < obstacleCount; i++) {
    obstacles.push({ x: 1 + i, y: height - 1 });
  }

  const patternType = id % 3;
  let cells;
  if (patternType === 0) {
    cells = [
      { dx: 0, dy: 0, color: 'cyan' },
      { dx: 1, dy: 0, color: 'magenta' },
    ];
  } else if (patternType === 1) {
    cells = [
      { dx: 0, dy: 0, color: 'magenta' },
      { dx: 0, dy: 1, color: 'yellow' },
    ];
  } else {
    cells = [
      { dx: 0, dy: 0, color: 'cyan' },
      { dx: 1, dy: 0, color: 'orange' },
    ];
  }

  const initialBlocks = [
    {
      x: 0,
      y: 0,
      color: cells[0].color === 'orange' ? 'magenta' : cells[0].color,
    },
  ];
  if (cells.length > 1 && cells[1].color !== 'orange') {
    initialBlocks.push({ x: width - 1, y: 0, color: 'yellow' });
  }

  stages.push({
    id,
    name: `ステージ ${id}`,
    board: { width, height },
    obstacles,
    initialBlocks,
    pattern: { cells },
    maxTurns,
    next: { initial: 'cyan' },
    spawn: { mode: 'random' },
    metadata: { difficulty: tier, par, isTutorial: false },
  });
}

const out = path.join(__dirname, '..', 'assets', 'data', 'stages.json');
fs.writeFileSync(out, JSON.stringify(stages, null, 2), 'utf8');
console.log(`Wrote ${stages.length} stages to ${out}`);
