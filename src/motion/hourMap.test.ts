import { describe, expect, it } from "vitest"
import { CHAPTER_TIMES, SECTIONS, formatHour } from "@/content/hours"
import {
  CHAPTERS,
  buildKeys,
  crossesChapter,
  cubicBezier,
  dPhase,
  discState,
  fmt,
  layerValues,
  quantize,
  timeAt,
  uiPhase,
  type Anchor,
} from "./hourMap"

// Pagina finta: 15 sezioni nell'ordine di Home, altezze tipiche del desktop (vh 900).
const VH = 900
const ORDER = [
  "a-chi",
  "servizi",
  "assistenza-24-7",
  "cambio-turno",
  "operatori-oss",
  "accompagnamento",
  "multidisciplinare",
  "perche",
  "come-funziona",
  "aree",
  "tariffe",
  "sera",
  "faq",
  "lavora-con-noi",
  "contatti",
] as const
const HEIGHTS: Record<string, number> = { "assistenza-24-7": 3 * VH, "cambio-turno": 2 * VH, sera: 1.2 * VH }

function page(heroH = 900, defaultH = 1100) {
  let top = heroH
  const anchors: (Anchor & { id: string })[] = []
  for (const id of ORDER) {
    const s = SECTIONS[id]
    const height = HEIGHTS[id] ?? defaultH
    anchors.push({ id, at: s.hourAt!, top, height, hours: s.hour!.split(",").map(Number) })
    top += height
  }
  const footer = 600
  return { anchors, maxScroll: top + footer - VH }
}

describe("T(y)", () => {
  const { anchors, maxScroll } = page()
  const keys = buildKeys(anchors, { H: 72, vh: VH, maxScroll })

  it("è monotona e copre 0-1440", () => {
    for (let i = 1; i < keys.length; i++) {
      expect(keys[i].y).toBeGreaterThan(keys[i - 1].y)
      expect(keys[i].t).toBeGreaterThanOrEqual(keys[i - 1].t)
    }
    let prev = -1
    for (let y = 0; y <= maxScroll; y += 37) {
      const t = timeAt(keys, y)
      expect(t).toBeGreaterThanOrEqual(prev)
      prev = t
    }
    expect(timeAt(keys, -50)).toBe(0)
    expect(timeAt(keys, maxScroll + 500)).toBe(1440)
  })

  it("all'ancora di ogni sezione «top» segna la sua ora", () => {
    for (const a of anchors) {
      if (a.at !== "top") continue
      const y = Math.min(a.top - 72, maxScroll)
      expect(Math.abs(timeAt(keys, y) - a.hours[0])).toBeLessThanOrEqual(10)
    }
  })

  it("le sezioni-cambio valgono 480 e 1260 a sezione centrata", () => {
    for (const a of anchors.filter((x) => x.at === "center")) {
      expect(timeAt(keys, a.top + a.height / 2 - VH / 2)).toBeCloseTo(a.hours[0], 5)
    }
  })

  it("il pin va da 210 a 450 lungo la corsa del palco", () => {
    const a = anchors.find((x) => x.at === "pin")!
    expect(timeAt(keys, a.top)).toBeCloseTo(210, 5)
    expect(timeAt(keys, a.top + a.height - VH)).toBeCloseTo(450, 5)
  })

  it("sul telefono (pin più corto dello schermo) resta monotona", () => {
    const short = anchors.map((a) => (a.at === "pin" ? { ...a, height: 500 } : a))
    const k = buildKeys(short, { H: 60, vh: 844, maxScroll })
    for (let i = 1; i < k.length; i++) expect(k[i].y).toBeGreaterThan(k[i - 1].y)
  })

  it("chiavi oltre il fondo restano monotone", () => {
    const k = buildKeys(anchors, { H: 72, vh: VH, maxScroll: 1000 })
    for (let i = 1; i < k.length; i++) expect(k[i].y).toBeGreaterThan(k[i - 1].y)
    expect(k[0]).toEqual({ y: 0, t: 0 })
  })
})

describe("cielo", () => {
  it("nei plateau un solo strato è pieno", () => {
    for (const [t, layer] of [
      [100, 0],
      [400, 1],
      [600, 3],
      [900, 4],
      [1200, 5],
      [1300, 6],
    ] as const) {
      const { o } = layerValues(t)
      expect(o.filter((v) => v > 0)).toEqual([1])
      expect(o[layer]).toBe(1)
    }
  })
  it("nei passaggi lo strato base resta a 1 sotto quello che entra", () => {
    const { o, z } = layerValues(330)
    expect(o[0]).toBe(1)
    expect(o[1]).toBeCloseTo(0.5)
    expect(z[1]).toBeGreaterThan(z[0])
    expect(layerValues(1440).o[0]).toBe(1)
  })
})

describe("disco", () => {
  it("luna e sole seguono la tabella", () => {
    expect(discState(0)).toEqual([0.12, 1, 0.88, 0])
    expect(discState(450)[0]).toBeCloseTo(0.88)
    expect(discState(495)[1]).toBeCloseTo(0.5)
    expect(discState(495)[3]).toBeCloseTo(0.5)
    expect(discState(900)[2]).toBeCloseTo(0.1)
    expect(discState(1260)[2]).toBeCloseTo(0.88)
    expect(discState(1440)[0]).toBeCloseTo(0.12)
    expect(discState(1440)[3]).toBe(0)
  })
})

describe("fasi e orologio", () => {
  it("fase dell'interfaccia e della D", () => {
    expect(uiPhase(479.9)).toBe("dark")
    expect(uiPhase(480)).toBe("light")
    expect(uiPhase(1259.9)).toBe("light")
    expect(uiPhase(1260)).toBe("dark")
    expect([dPhase(0), dPhase(500), dPhase(600), dPhase(1200), dPhase(1300)]).toEqual(["notte", "alba", "mattino", "tramonto", "notte"])
  })
  it("passi di 10 minuti e formato identico a formatHour", () => {
    expect(quantize(239.9)).toBe(230)
    for (let t = -10; t <= 1440; t += 10) expect(fmt(t)).toBe(formatHour(t))
    expect(fmt(-10)).toBe("21:50")
  })
  it("le ore-capitolo sono quelle della tabella", () => {
    expect(CHAPTERS).toEqual(CHAPTER_TIMES)
    expect(crossesChapter(170, 180)).toBe(true)
    expect(crossesChapter(180, 170)).toBe(true)
    expect(crossesChapter(180, 190)).toBe(false)
  })
  it("cubic-bezier: estremi e monotonia", () => {
    const e = cubicBezier(0.22, 1, 0.36, 1)
    expect(e(0)).toBe(0)
    expect(e(1)).toBe(1)
    let prev = 0
    for (let p = 0.05; p < 1; p += 0.05) {
      const v = e(p)
      expect(v).toBeGreaterThanOrEqual(prev)
      prev = v
    }
  })
})
