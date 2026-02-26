/** XP thresholds per level */
export const XP_PER_LEVEL = 200

/** Compute level number from XP */
export function xpToLevel(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

/** XP remaining until next level */
export function xpToNextLevel(xp) {
  return XP_PER_LEVEL - (xp % XP_PER_LEVEL)
}

/** XP progress within current level as 0–100 percentage */
export function xpLevelPercent(xp) {
  return ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100
}

// ── Molecules available in the Lab ─────────────────────────────
export const MOLS = {
  water: {
    formula: 'H₂O',
    nameRU:  'Вода',
    nameUZ:  'Suv',
    atoms:   { H: 2, O: 1 },
    col:     '#22d3ee',
  },
  co2: {
    formula: 'CO₂',
    nameRU:  'Углекислый газ',
    nameUZ:  'Karbonat angidrid',
    atoms:   { C: 1, O: 2 },
    col:     '#f472b6',
  },
  glucose: {
    formula: 'C₆H₁₂O₆',
    nameRU:  'Глюкоза',
    nameUZ:  'Glyukoza',
    atoms:   { C: 6, H: 12, O: 6 },
    col:     '#4fc3f7',
  },
}

// ── Atom colour palette ─────────────────────────────────────────
export const ACOL = {
  C: { bg: '#1e1b4b', gw: '#4fc3f7' },
  H: { bg: '#1e3a5f', gw: '#93c5fd' },
  O: { bg: '#4c0519', gw: '#fb7185' },
}

// ── Atom display names ──────────────────────────────────────────
export const ATOM_NAMES = {
  RU: { C: 'Углеродик', H: 'Водородик', O: 'Кислородик' },
  UZ: { C: 'Uglerodcha', H: 'Vodorodcha', O: 'Kislorodcha' },
}

// ── Topic card visual meta (icons, gradients, progress) ────────
export const TOPIC_META = [
  { icon: '⚡', grad: 'linear-gradient(135deg,#0891b2,#1d4ed8)', prog: 65, mol: 'C₁₀H₁₆N₅O₁₃P₃', tc: 'rgba(103,232,249,0.2)', tcol: '#67e8f9' },
  { icon: '🦴', grad: 'linear-gradient(135deg,#7c3aed,#6d28d9)', prog: 40, mol: 'Ca₁₀(PO₄)₆(OH)₂', tc: 'rgba(196,181,253,0.2)', tcol: '#c4b5fd' },
  { icon: '💫', grad: 'linear-gradient(135deg,#db2777,#e11d48)', prog: 20, mol: 'C₈H₁₁NO₂',         tc: 'rgba(251,113,133,0.2)', tcol: '#fb7185' },
]

// ── Body organ click-zone positions (% of SVG viewBox 100×162) ─
export const ORGAN_POS = {
  brain:   { x: 37, y: 2,  w: 26, h: 16, emoji: '🧠' },
  heart:   { x: 38, y: 32, w: 12, h: 12, emoji: '❤️' },
  lungs:   { x: 22, y: 28, w: 56, h: 18, emoji: '🫁' },
  liver:   { x: 50, y: 44, w: 18, h: 14, emoji: '🟫' },
  stomach: { x: 32, y: 44, w: 16, h: 14, emoji: '🟡' },
  muscle:  { x: 24, y: 64, w: 52, h: 20, emoji: '💪' },
}

// ── Medal definitions ───────────────────────────────────────────
export const MEDAL_DEF = [
  { id: 'first',  icon: '⚗️', col: '#fbbf24' },
  { id: 'lab1',   icon: '🧪', col: '#4fc3f7' },
  { id: 'lab2',   icon: '🧬', col: '#a78bfa' },
  { id: 'body1',  icon: '🫀', col: '#f472b6' },
  { id: 'genius', icon: '🏆', col: '#fbbf24' },
]

// ── Roadmap level icons / colours ──────────────────────────────
export const LV_ICONS = ['🌱', '⚗️', '🔬', '🧬', '🏆']
export const LV_COLS  = ['#22d3ee', '#a78bfa', '#f472b6', '#4ade80', '#fbbf24']

// ── Navigation items ────────────────────────────────────────────
export const NAV = [
  { id: 'home',    icon: '🏠' },
  { id: 'body',    icon: '🫀' },
  { id: 'lab',     icon: '🧪' },
  { id: 'medals',  icon: '🏆' },
  { id: 'roadmap', icon: '🗺' },
]
