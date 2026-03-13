/**
 * Molecule structure validator — checks valence rules and graph connectivity.
 *
 * Usage:
 *   const result = validateMolecule(slots, bonds)
 *   // result: { ok, error, overloaded }
 */

// Typical valence numbers used in school chemistry
const VALENCE = {
  H: 1, He: 0,
  Li: 1, Be: 2, B: 3, C: 4, N: 3, O: 2, F: 1, Ne: 0,
  Na: 1, Mg: 2, Al: 3, Si: 4, P: 3, S: 2, Cl: 1, Ar: 0,
  K: 1, Ca: 2, Fe: 3, Cu: 2, Zn: 2,
}

/**
 * Validate a user-built molecule graph.
 *
 * @param {Array<{id: string, symbol: string}>} slots
 *   Each atom placed in the workspace.  `id` is unique (e.g. "H-0", "O-0").
 *
 * @param {Array<[string, string]>} bonds
 *   Each bond is a pair of atom ids, e.g. ["H-0", "O-0"].
 *
 * @returns {{ ok: boolean, error: string|null, overloaded: string[] }}
 */
export function validateMolecule(slots, bonds) {
  if (slots.length === 0) {
    return { ok: false, error: 'Добавь атомы в рабочую область', overloaded: [] }
  }

  // 1. Count actual bonds per atom id
  const bondCount = {}
  for (const { id } of slots) bondCount[id] = 0

  for (const [a, b] of bonds) {
    bondCount[a] = (bondCount[a] ?? 0) + 1
    bondCount[b] = (bondCount[b] ?? 0) + 1
  }

  // 2. Check valence for each atom
  const overloaded  = []
  const unsatisfied = []

  for (const { id, symbol } of slots) {
    const required = VALENCE[symbol] ?? 1
    const actual   = bondCount[id] ?? 0

    if (actual > required)  overloaded.push(symbol)
    if (actual < required)  unsatisfied.push(symbol)
  }

  if (overloaded.length > 0) {
    return {
      ok: false,
      error: `Слишком много связей у: ${[...new Set(overloaded)].join(', ')}`,
      overloaded,
    }
  }
  if (unsatisfied.length > 0) {
    return {
      ok: false,
      error: `Не хватает связей у: ${[...new Set(unsatisfied)].join(', ')}`,
      overloaded: [],
    }
  }

  // 3. Graph connectivity — all atoms must be in one molecule
  if (!isConnected(slots, bonds)) {
    return {
      ok: false,
      error: 'Молекула распалась на части — все атомы должны быть связаны!',
      overloaded: [],
    }
  }

  return { ok: true, error: null, overloaded: [] }
}

/** BFS connectivity check */
function isConnected(slots, bonds) {
  if (slots.length <= 1) return true

  const adj = {}
  for (const { id } of slots) adj[id] = []
  for (const [a, b] of bonds) {
    if (adj[a]) adj[a].push(b)
    if (adj[b]) adj[b].push(a)
  }

  const visited = new Set()
  const queue   = [slots[0].id]
  while (queue.length > 0) {
    const node = queue.shift()
    if (visited.has(node)) continue
    visited.add(node)
    for (const neighbour of (adj[node] ?? [])) queue.push(neighbour)
  }
  return visited.size === slots.length
}

/**
 * Check whether user-placed atoms match the target molecule atoms.
 * Used as a quick "did you place the right atoms?" pre-check.
 *
 * @param {Array<{symbol: string}>} slots  — atoms placed by user
 * @param {Object}  targetAtoms            — e.g. { H: 2, O: 1 }
 */
export function atomsMatchTarget(slots, targetAtoms) {
  const counts = {}
  for (const { symbol } of slots) counts[symbol] = (counts[symbol] ?? 0) + 1

  for (const [sym, required] of Object.entries(targetAtoms)) {
    if ((counts[sym] ?? 0) !== required) return false
  }
  // No extra atoms
  for (const sym of Object.keys(counts)) {
    if (!(sym in targetAtoms)) return false
  }
  return true
}
