/**
 * Sound engine using Web Audio API — no external files needed.
 * Each "type" maps to a sequence of [frequency, delay, duration, waveform, volume].
 *
 * New patterns added:
 *   catch    — short rising chirp (electron caught)
 *   proton   — low buzzy hit (proton clicked)
 *   levelup  — 3-note rising fanfare (game level up)
 *   quest    — celebratory ascending run (quest completed)
 */

const PATTERNS = {
  click:   [[440, 0, 0.06, 'sine', 0.4], [660, 0.05, 0.08, 'sine', 0.2]],
  win:     [[523, 0, 0.12, 'sine', 0.3], [659, 0.12, 0.12, 'sine', 0.3], [784, 0.24, 0.12, 'sine', 0.3], [1047, 0.36, 0.35, 'sine', 0.3]],
  drop:    [[300, 0, 0.07, 'sine', 0.5], [450, 0.07, 0.08, 'sine', 0.3]],
  wrong:   [[200, 0, 0.1, 'sawtooth', 0.3], [180, 0.1, 0.12, 'sawtooth', 0.2]],
  medal:   [[523, 0, 0.1, 'sine', 0.3], [784, 0.1, 0.1, 'sine', 0.3], [1047, 0.2, 0.2, 'sine', 0.3], [1319, 0.3, 0.35, 'sine', 0.3]],
  boom:    [[80,  0, 0.3, 'sine', 0.5], [120, 0.05, 0.2, 'sine', 0.25]],
  think:   [[880, 0, 0.06, 'sine', 0.2], [1100, 0.12, 0.1, 'sine', 0.15]],
  breathe: [[300, 0, 0.25, 'sine', 0.15], [250, 0.25, 0.25, 'sine', 0.1]],
  process: [[440, 0, 0.06, 'sine', 0.3], [550, 0.1, 0.06, 'sine', 0.3], [660, 0.2, 0.1, 'sine', 0.3]],
  digest:  [[200, 0, 0.2, 'sawtooth', 0.1]],
  flex:    [[150, 0, 0.1, 'square', 0.1], [200, 0.12, 0.1, 'square', 0.08]],
  // ── New patterns ─────────────────────────────────────────────
  // Electron caught: quick high ping-ping
  catch:   [[1200, 0, 0.05, 'sine', 0.35], [1600, 0.06, 0.07, 'sine', 0.25]],
  // Proton hit: low descending buzz
  proton:  [[260, 0, 0.08, 'sawtooth', 0.4], [160, 0.08, 0.15, 'sawtooth', 0.25]],
  // Level up: 3-note ascending fanfare
  levelup: [[523, 0, 0.1, 'sine', 0.3], [784, 0.11, 0.1, 'sine', 0.3], [1047, 0.22, 0.25, 'sine', 0.35]],
  // Quest complete: 5-note triumphant run
  quest:   [[392, 0, 0.08, 'sine', 0.28], [523, 0.09, 0.08, 'sine', 0.28], [659, 0.18, 0.08, 'sine', 0.28], [784, 0.27, 0.08, 'sine', 0.28], [1047, 0.36, 0.3, 'sine', 0.32]],
}

export function snd(type) {
  try {
    const ac     = new (window.AudioContext || window.webkitAudioContext)()
    const master = ac.createGain()
    master.gain.value = 0.4
    master.connect(ac.destination)

    const notes = PATTERNS[type] ?? PATTERNS.click
    notes.forEach(([f, d, dur, w = 'sine', v = 0.3]) => {
      const osc = ac.createOscillator()
      const g   = ac.createGain()
      osc.connect(g)
      g.connect(master)
      osc.frequency.value = f
      osc.type = w
      g.gain.setValueAtTime(0, ac.currentTime + d)
      g.gain.linearRampToValueAtTime(v, ac.currentTime + d + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + d + dur)
      osc.start(ac.currentTime + d)
      osc.stop(ac.currentTime + d + dur + 0.05)
    })

    setTimeout(() => ac.close(), 2500)
  } catch (_) {
    // AudioContext blocked (e.g. before user gesture) — silently ignore
  }
}
