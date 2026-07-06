export type CmyRatio = [number, number, number];

export const MAX_BLOCK_COMPONENT = 3;

function gcd2(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function gcd3(c: number, m: number, y: number): number {
  return gcd2(gcd2(c, m), y);
}

export function simplifyRatio([c, m, y]: CmyRatio): CmyRatio {
  const g = gcd3(c, m, y);
  if (g === 0) return [0, 0, 0];
  return [c / g, m / g, y / g];
}

export function ratioGcd([c, m, y]: CmyRatio): number {
  return gcd3(c, m, y);
}

export function ratioKey(ratio: CmyRatio): string {
  const [c, m, y] = simplifyRatio(ratio);
  return `${c},${m},${y}`;
}

export function addRawRatios(a: CmyRatio, b: CmyRatio): CmyRatio {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

/** Catalog / legacy helpers: add then normalize. */
export function addRatios(a: CmyRatio, b: CmyRatio): CmyRatio {
  return simplifyRatio(addRawRatios(a, b));
}

export function isPrimaryRatio([c, m, y]: CmyRatio): boolean {
  const simplified = simplifyRatio([c, m, y]);
  const sum = simplified[0] + simplified[1] + simplified[2];
  return sum === 1;
}

export function isWithinBlockLimit(ratio: CmyRatio): boolean {
  return Math.max(...ratio) <= MAX_BLOCK_COMPONENT;
}
