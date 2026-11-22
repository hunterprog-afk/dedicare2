// Funzione del tempo T(y) e stati che ne dipendono (cielo, disco, fasi). Pura: nessun accesso al DOM.
// `t` = minuti dalle 22:00 (0-1440).

export interface Key {
  y: number
  t: number
}

export interface Anchor {
  at: "top" | "center" | "pin"
  /** Cima assoluta della sezione (rect.top + scrollY). */
  top: number
  height: number
  /** Valori di data-hour (due per il pin). */
  hours: number[]
}

export interface Env {
  /** Altezza dell'header: 72 da 1024 px in su, altrimenti 60. */
  H: number
  vh: number
  maxScroll: number
}

export const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v)

/** Fotogrammi chiave: uno per sezione (due per il pin), agganciati alla linea dell'header o al centro. */
export function buildKeys(anchors: readonly Anchor[], { H, vh, maxScroll }: Env): Key[] {
  const raw: Key[] = [{ y: 0, t: 0 }]
  for (const a of anchors) {
    const t0 = a.hours[0] ?? 0
    if (a.at === "pin") {
      let s = a.top
      let e = a.top + a.height - vh
      if (e - s < 1) {
        s = a.top - H
        if (e - s < 1) e = s + 1
      }
      raw.push({ y: s, t: t0 }, { y: e, t: a.hours[1] ?? t0 })
    } else if (a.at === "center") {
      raw.push({ y: a.top + a.height / 2 - vh / 2, t: t0 })
    } else {
      raw.push({ y: a.top - H, t: t0 })
    }
  }
  raw.push({ y: maxScroll, t: 1440 })

  const keys: Key[] = []
  for (const k of raw) {
    let y = clamp(k.y, 0, Math.max(0, maxScroll))
    const prev = keys[keys.length - 1]
    if (prev && y <= prev.y) y = prev.y + 1
    keys.push({ y, t: k.t })
  }
  return keys
}

/** Interpolazione lineare a tratti; fuori dai limiti, la chiave estrema. */
export function timeAt(keys: readonly Key[], y: number): number {
  const n = keys.length
  if (!n) return 0
  if (y <= keys[0].y) return keys[0].t
  if (y >= keys[n - 1].y) return keys[n - 1].t
  let lo = 0
  let hi = n - 1
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1
    if (keys[m].y <= y) lo = m
    else hi = m
  }
  const a = keys[lo]
  const b = keys[hi]
  return a.t + ((b.t - a.t) * (y - a.y)) / (b.y - a.y)
}

/** Cielo: [inizio, fine, strato base, strato che entra (-1 = plateau)]. Indici 0-6 = S1-S7. */
const SKY: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, 300, 0, -1],
  [300, 360, 0, 1],
  // Il testo chiaro dell'assistenza 24/7 resta sul cielo fino a t = 470: l'alba arriva solo quando la foto a tutto schermo del cambio turno la copre.
  [360, 470, 1, -1],
  [470, 480, 1, 2],
  [480, 500, 2, 3],
  [500, 780, 3, -1],
  [780, 840, 3, 4],
  [840, 1080, 4, -1],
  [1080, 1140, 4, 5],
  [1140, 1230, 5, -1],
  [1230, 1260, 5, 6],
  [1260, 1380, 6, -1],
  [1380, 1440, 6, 0],
]

export interface SkyState {
  base: number
  over: number
  p: number
}

export function layerState(t: number): SkyState {
  const tt = clamp(t, 0, 1440)
  for (const [a, b, base, over] of SKY) {
    if (tt < b || b === 1440) return { base, over, p: over < 0 ? 0 : (tt - a) / (b - a) }
  }
  return { base: 0, over: -1, p: 0 }
}

/** Opacità e z-index di ognuno dei 7 strati: base 1 (z 1), entrante p (z 2), gli altri 0 (z 0). */
export function layerValues(t: number): { o: number[]; z: number[] } {
  const { base, over, p } = layerState(t)
  const o = [0, 0, 0, 0, 0, 0, 0]
  const z = [0, 0, 0, 0, 0, 0, 0]
  o[base] = 1
  z[base] = 1
  if (over >= 0) {
    o[over] = p
    z[over] = 2
  }
  return { o, z }
}

const lin = (t: number, a: number, b: number, va: number, vb: number) => va + (vb - va) * clamp((t - a) / (b - a))

/** Disco: [luna Y, luna opacità, sole Y, sole opacità]; Y in frazioni dell'altezza della finestra. */
export function discState(t: number): [number, number, number, number] {
  const tt = clamp(t, 0, 1440)
  let my = 0.88
  let mo: number
  if (tt <= 450) {
    my = lin(tt, 0, 450, 0.12, 0.88)
    mo = 1
  } else if (tt <= 480) mo = 1
  else if (tt <= 510) mo = lin(tt, 480, 510, 1, 0)
  else if (tt <= 1260) mo = 0
  else if (tt <= 1290) mo = lin(tt, 1260, 1290, 0, 1)
  else if (tt <= 1320) mo = 1
  else {
    my = lin(tt, 1320, 1440, 0.88, 0.12)
    mo = 1
  }

  let sy = 0.88
  let so = 0
  if (tt >= 480 && tt <= 900) {
    sy = lin(tt, 480, 900, 0.88, 0.1)
    so = lin(tt, 480, 510, 0, 1)
  } else if (tt > 900 && tt <= 1260) {
    sy = lin(tt, 900, 1260, 0.1, 0.88)
    so = 1
  } else if (tt > 1260 && tt <= 1290) {
    so = lin(tt, 1260, 1290, 1, 0)
  }
  return [my, mo, sy, so]
}

/** Centro verticale del disco in px: la corsa [0.10, 0.88] di `discState` scende a [max(18vh, 152), 0.88vh],
 *  così la luna delle 22:00 non finisce sotto l'header (72 px + mezzo disco 56 + 24 d'aria). */
export function discCenter(f: number, vh: number): number {
  const lo = Math.max(0.18 * vh, 152)
  const hi = 0.88 * vh
  return lo + ((f - 0.1) / 0.78) * (hi - lo)
}

/** Distanza (px) fra centro dell'indicatore e centro di un capitolo sotto la quale il capitolo si spegne. */
export const NEAR = 21

export type UiPhase = "dark" | "light"
export type DPhase = "notte" | "alba" | "mattino" | "tramonto"

export const uiPhase = (t: number): UiPhase => (t < 480 || t >= 1260 ? "dark" : "light")

export function dPhase(t: number): DPhase {
  if (t < 480 || t >= 1260) return "notte"
  if (t < 540) return "alba"
  if (t < 1140) return "mattino"
  return "tramonto"
}

/** Minuti mostrati: passi di 10. */
export const quantize = (t: number) => Math.floor(t / 10 + 1e-9) * 10

/** Stesso formato di `formatHour` in content/hours (il test le confronta): 24 ore, `(1320 + t) mod 1440`. */
export function fmt(t: number): string {
  const m = (((1320 + t) % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
}

/** Ore-capitolo che fanno respirare la D (copia di CHAPTER_TIMES, verificata dal test). */
export const CHAPTERS: readonly number[] = [180, 240, 480, 540, 600, 720, 780, 840, 960, 1140, 1200, 1260, 1320, 1380, 1440]

/** Vero se fra due ore mostrate c'è almeno un'ora-capitolo (in entrambe le direzioni). */
export const crossesChapter = (a: number, b: number) => CHAPTERS.some((c) => a < c !== b < c)

/** Curva cubic-bezier come funzione 0-1 (per le interpolazioni di GSAP core, che non ha CustomEase). */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (p: number) => number {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by
  const sx = (u: number) => ((ax * u + bx) * u + cx) * u
  const dx = (u: number) => (3 * ax * u + 2 * bx) * u + cx
  return (p) => {
    if (p <= 0) return 0
    if (p >= 1) return 1
    let u = p
    for (let i = 0; i < 8; i++) {
      const err = sx(u) - p
      if (Math.abs(err) < 1e-6) break
      const d = dx(u)
      if (Math.abs(d) < 1e-6) break
      u -= err / d
    }
    u = clamp(u)
    return ((ay * u + by) * u + cy) * u
  }
}

/** decodeURIComponent che non lancia: un hash malformato (es. `#%E0`) resta com'è. */
export function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}
