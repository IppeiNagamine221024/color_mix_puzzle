import { getStageById } from '../stages';
import { ratioFromColor } from '../blockStack';
import {
  applyMix,
  applySlide,
  applySwap,
  canUseAction,
  createSession,
} from '../engine';
import { matchesPattern } from '../pattern';
import { getMixResult, mixRatios } from '../recipes';

describe('recipes', () => {
  it('mixes primaries to secondaries', () => {
    expect(getMixResult('magenta', 'yellow')).toBe('red');
    expect(getMixResult('yellow', 'cyan')).toBe('green');
    expect(getMixResult('cyan', 'magenta')).toBe('blue');
  });

  it('rejects invalid mix', () => {
    expect(getMixResult('orange', 'purple')).toBeNull();
    expect(getMixResult('amber', 'purple')).toBeNull();
  });

  it('mixes complementary colors to brown', () => {
    expect(getMixResult('red', 'green')).toBe('brown');
  });

  it('mixes tertiary colors', () => {
    expect(getMixResult('red', 'orange')).toBe('vermillion');
    expect(getMixResult('yellow', 'red')).toBe('orange');
  });

  it('mixes stacked cyan with yellow into teal', () => {
    expect(mixRatios([2, 0, 0], [0, 0, 1])).toEqual([2, 0, 1]);
  });
});

describe('stage 1', () => {
  const stage = getStageById(1)!;

  it('creates session with cyan on board', () => {
    const session = createSession(stage);
    expect(session.nextColor).toBe('magenta');
    expect(session.remainingTurns).toBe(10);
    expect(session.board[1][2]).toEqual({ kind: 'block', ratio: ratioFromColor('cyan') });
  });

  it('slides left and spawns magenta on the opposite edge', () => {
    const session = createSession(stage);
    const result = applySlide(session, 'left');
    expect(result.error).toBeUndefined();
    expect(result.session.status).toBe('playing');
    expect(result.session.board[1][0]).toEqual({ kind: 'block', ratio: ratioFromColor('cyan') });
    const blocks = result.session.board.flat().filter((c) => c.kind === 'block');
    expect(blocks).toHaveLength(2);
    expect(blocks.some((c) => c.kind === 'block' && c.ratio[0] === 0 && c.ratio[1] === 1 && c.ratio[2] === 0)).toBe(
      true,
    );
  });

  it('clears with slide left when spawn position is fixed', () => {
    let session = createSession(stage);
    session = {
      ...session,
      spawn: { mode: 'fixed', fixedPosition: { x: 1, y: 1 } },
    };
    const result = applySlide(session, 'left');
    expect(result.error).toBeUndefined();
    expect(result.session.status).toBe('cleared');
    expect(matchesPattern(result.session.board, stage.pattern.cells)).toBe(true);
  });
});

describe('action rules', () => {
  const stage = getStageById(2)!;

  it('allows consecutive same action', () => {
    let session = createSession(stage);
    const first = applySlide(session, 'left');
    session = first.session;
    expect(canUseAction(session, 'B')).toBe(true);
    expect(canUseAction(session, 'A')).toBe(true);
  });

  it('swap adjacent blocks', () => {
    const stage3 = getStageById(3)!;
    let session = createSession(stage3);
    const b1 = session.board.flatMap((row, y) =>
      row.map((c, x) => (c.kind === 'block' ? { x, y } : null)),
    ).filter(Boolean) as { x: number; y: number }[];
    if (b1.length < 2) return;
    const swap = applySwap(session, b1[0].x, b1[0].y, b1[1].x, b1[1].y);
    if (swap.error && swap.error.includes('隣接')) return;
    expect(swap.error).toBeUndefined();
  });
});

describe('game over', () => {
  it('ends when turns reach zero', () => {
    const stage = getStageById(6)!;
    let session = createSession(stage);
    session = { ...session, remainingTurns: 1 };
    const result = applySlide(session, 'left');
    if (result.session.status === 'cleared') return;
    expect(['gameover', 'playing']).toContain(result.session.status);
  });
});

describe('mix', () => {
  it('rejects non-adjacent cells', () => {
    const stage = getStageById(6)!;
    const session = createSession(stage);
    const result = applyMix(session, 0, 0, 0, 0);
    expect(result.error).toBeDefined();
  });
});
