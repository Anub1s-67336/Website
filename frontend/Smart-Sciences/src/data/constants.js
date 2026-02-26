// ── Exponential XP progression ─────────────────────────────────
// Each level requires 20% more XP than the previous one.
// Level 1 = 200 XP, Level 2 = 240 XP, Level 3 = 288 XP …

const BASE_XP = 200
const GROWTH  = 1.2

/** XP required to COMPLETE level n (1-indexed) */
export function xpForLevel(n) {
  return Math.floor(BASE_XP * Math.pow(GROWTH, n - 1))
}

/** Total cumulative XP needed to REACH level n (i.e. to start it) */
export function totalXpToReach(n) {
  if (n <= 1) return 0
  let total = 0
  for (let i = 1; i < n; i++) total += xpForLevel(i)
  return total
}

/** Current level given total accumulated XP */
export function xpToLevel(xp) {
  let level = 1
  while (totalXpToReach(level + 1) <= xp) level++
  return level
}

/** Progress info within the current level */
export function xpLevelProgress(xp) {
  const level    = xpToLevel(xp)
  const startXp  = totalXpToReach(level)
  const required = xpForLevel(level)
  const progress = xp - startXp
  return {
    level,
    progress,
    required,
    percent: Math.min(100, (progress / required) * 100),
    toNext:  required - progress,
  }
}

// Kept for backwards-compat with any code that still uses these names
export const XP_PER_LEVEL     = 200
export const xpToNextLevel    = (xp) => xpLevelProgress(xp).toNext
export const xpLevelPercent   = (xp) => xpLevelProgress(xp).percent

// ── Daily quest definitions ─────────────────────────────────────
export const DAILY_QUESTS = [
  { id: 'dq_lab',      icon: '🧪', target: 3,  xpReward: 50, medalReward: 'daily_lab'  },
  { id: 'dq_electron', icon: '⚡', target: 20, xpReward: 30, medalReward: null          },
  { id: 'dq_visit',    icon: '🫀', target: 4,  xpReward: 20, medalReward: null          },
]

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
  { id: 'first',           icon: '⚗️', col: '#fbbf24' },
  { id: 'lab1',            icon: '🧪', col: '#4fc3f7' },
  { id: 'lab2',            icon: '🧬', col: '#a78bfa' },
  { id: 'body1',           icon: '🫀', col: '#f472b6' },
  { id: 'genius',          icon: '🏆', col: '#fbbf24' },
  { id: 'tutorial_done',   icon: '🤖', col: '#818cf8' },
  { id: 'electron_hunter', icon: '⚡', col: '#22d3ee' },
  { id: 'daily_lab',       icon: '📅', col: '#4ade80' },
  { id: 'lesson_atp',      icon: '⚡', col: '#67e8f9' },
  { id: 'lesson_calcium',  icon: '🦴', col: '#c4b5fd' },
  { id: 'lesson_dopamine', icon: '🧠', col: '#f9a8d4' },
]

// ── Roadmap level icons / colours ──────────────────────────────
export const LV_ICONS = ['🌱', '⚗️', '🔬', '🧬', '🏆']
export const LV_COLS  = ['#22d3ee', '#a78bfa', '#f472b6', '#4ade80', '#fbbf24']

// ── Navigation items ────────────────────────────────────────────
export const NAV = [
  { id: 'home',     icon: '🏠' },
  { id: 'body',     icon: '🫀' },
  { id: 'lab',      icon: '🧪' },
  { id: 'electron', icon: '⚡' },
  { id: 'medals',   icon: '🏆' },
  { id: 'roadmap',  icon: '🗺' },
]
