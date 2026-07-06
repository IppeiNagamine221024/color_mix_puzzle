/** 明るい木材・絵具パレット調の暖色テーマ */
export const Theme = {
  bg: '#dbc9a8',
  bgElevated: '#cdb890',
  surface: '#e8d5b5',
  surfaceRaised: '#f2e6d0',
  surfaceGlass: 'rgba(242, 230, 208, 0.96)',
  border: '#8b6848',
  borderLight: '#faf3e8',
  borderStrong: '#6b4c32',
  text: '#3d2817',
  textMuted: '#5c4030',
  textDim: '#8a7058',
  accent: '#a85c38',
  accentSoft: '#e8d0b8',
  accentGlow: '#c47848',
  teal: '#6a9080',
  tealSoft: '#c8d8d0',
  warm: '#c48820',
  warmSoft: '#f0e0c0',
  danger: '#b84a3a',
  success: '#6a9048',
  heart: '#c45040',
  boardEmpty: '#b89878',
  boardFrame: '#a08060',
  obstacle: '#907050',
  selection: '#d4940a',
  overlay: 'rgba(61, 40, 24, 0.55)',
  overlayLight: 'rgba(61, 40, 24, 0.35)',
  shadow: '#4a3020',
  cardShadow: '#4a3020',
} as const;

/** 絵の具の色をイメージした操作ボタン */
export const actionColors = {
  A: { bg: '#b84848', light: '#d87878' },
  B: { bg: '#a08060', light: '#c8a888' },
  C: { bg: '#4868a0', light: '#7898c0' },
} as const;
