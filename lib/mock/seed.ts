// Deterministic seeded randomness + allocation helpers. Never use Math.random in the OS.

/** Classic mulberry32 PRNG. Returns floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface Rng {
  /** float in [0, 1) */
  next(): number
  /** integer in [min, max], inclusive */
  int(min: number, max: number): number
  pick<T>(arr: readonly T[]): T
  /** Box-Muller normal sample */
  normal(mean: number, sd: number): number
  /** Returns a NEW shuffled array (Fisher-Yates). */
  shuffle<T>(arr: readonly T[]): T[]
}

export function rng(seed: number): Rng {
  const next = mulberry32(seed)
  const r: Rng = {
    next,
    int(min, max) {
      const lo = Math.ceil(Math.min(min, max))
      const hi = Math.floor(Math.max(min, max))
      return lo + Math.floor(next() * (hi - lo + 1))
    },
    pick(arr) {
      return arr[Math.floor(next() * arr.length)]
    },
    normal(mean, sd) {
      let u = 0
      while (u <= Number.EPSILON) u = next()
      const v = next()
      const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
      return mean + z * sd
    },
    shuffle(arr) {
      const out = arr.slice()
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        const tmp = out[i]
        out[i] = out[j]
        out[j] = tmp
      }
      return out
    },
  }
  return r
}

/**
 * Largest-remainder allocation of an integer total in proportion to weights.
 * The result sums to `total` exactly (when any weight is positive); zero or negative weights get 0.
 */
export function allocate(total: number, weights: readonly number[]): number[] {
  const n = weights.length
  const out = new Array<number>(n).fill(0)
  const T = Math.round(total)
  const w = weights.map((x) => (Number.isFinite(x) && x > 0 ? x : 0))
  const W = w.reduce((s, x) => s + x, 0)
  if (n === 0 || W <= 0 || T <= 0) return out
  const rema: { i: number; r: number }[] = []
  let used = 0
  for (let i = 0; i < n; i++) {
    const exact = (T * w[i]) / W
    const fl = Math.floor(exact)
    out[i] = fl
    used += fl
    if (w[i] > 0) rema.push({ i, r: exact - fl })
  }
  // Stable: larger remainder first, ties by index.
  rema.sort((a, b) => b.r - a.r || a.i - b.i)
  let left = T - used
  for (let k = 0; left > 0 && rema.length > 0; k = (k + 1) % rema.length) {
    out[rema[k].i] += 1
    left--
  }
  return out
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10
}
