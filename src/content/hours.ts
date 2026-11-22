// Tabella delle ore: unica fonte. `t` = minuti dalle 22:00 (0-1440).

export type Tone = "dark" | "light" | "dusk"
export type Band = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7"
export type HourAt = "top" | "center" | "pin"

export type SectionId =
  | "inizio"
  | "a-chi"
  | "servizi"
  | "assistenza-24-7"
  | "cambio-turno"
  | "operatori-oss"
  | "accompagnamento"
  | "multidisciplinare"
  | "perche"
  | "come-funziona"
  | "aree"
  | "tariffe"
  | "sera"
  | "faq"
  | "lavora-con-noi"
  | "contatti"

export interface SectionHour {
  tone: Tone
  band: Band
  hourAt?: HourAt
  /** Valore di data-hour: minuti dalle 22:00 (per il pin: inizio e fine). */
  hour?: string
  /** Ora mostrata senza movimento. */
  label: string
  phaseSwitch?: "light" | "dark"
}

/** Ora in formato HH:MM, sempre 24 ore: `(1320 + t) mod 1440`. */
export function formatHour(t: number): string {
  const m = (((1320 + t) % 1440) + 1440) % 1440
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
}

export const SECTIONS: Record<SectionId, SectionHour> = {
  inizio: { tone: "dark", band: "S1", label: "22:00" },
  "a-chi": { tone: "dark", band: "S1", hourAt: "top", hour: "0", label: "22:00" },
  servizi: { tone: "dark", band: "S1", hourAt: "top", hour: "180", label: "01:00" },
  "assistenza-24-7": { tone: "dark", band: "S1", hourAt: "pin", hour: "210,450", label: "02:00" },
  "cambio-turno": { tone: "dark", band: "S3", hourAt: "center", hour: "480", label: "06:00", phaseSwitch: "light" },
  "operatori-oss": { tone: "light", band: "S4", hourAt: "top", hour: "540", label: "07:00" },
  accompagnamento: { tone: "light", band: "S4", hourAt: "top", hour: "720", label: "10:00" },
  multidisciplinare: { tone: "light", band: "S4", hourAt: "top", hour: "780", label: "11:00" },
  perche: { tone: "light", band: "S5", hourAt: "top", hour: "840", label: "12:00" },
  "come-funziona": { tone: "dusk", band: "S5", hourAt: "top", hour: "960", label: "14:00" },
  aree: { tone: "dusk", band: "S6", hourAt: "top", hour: "1140", label: "17:00" },
  tariffe: { tone: "dusk", band: "S6", hourAt: "top", hour: "1200", label: "18:00" },
  sera: { tone: "dark", band: "S7", hourAt: "center", hour: "1260", label: "19:00", phaseSwitch: "dark" },
  faq: { tone: "dark", band: "S7", hourAt: "top", hour: "1320", label: "20:00" },
  "lavora-con-noi": { tone: "dark", band: "S7", hourAt: "top", hour: "1380", label: "21:00" },
  contatti: { tone: "dark", band: "S1", hourAt: "top", hour: "1440", label: "22:00" },
}

/** Attributi data-* e id della sezione: il contratto con il motore di movimento. */
export function sectionAttrs(id: SectionId) {
  const s = SECTIONS[id]
  return {
    id,
    "data-tone": s.tone,
    "data-band": s.band,
    "data-hour-at": s.hourAt,
    "data-hour": s.hour,
    "data-label-hour": s.label,
    "data-phase-switch": s.phaseSwitch,
  } as const
}

export interface IndexEntry {
  id: Exclude<SectionId, "inizio">
  /** Minuti dalle 22:00 della voce sul binario. */
  t: number
}

/** Le 15 voci dell'indice (binario desktop e foglio telefono): una per ora-capitolo, servizi del giorno compresi. */
export const INDEX_ENTRIES: readonly IndexEntry[] = [
  { id: "a-chi", t: 0 },
  { id: "servizi", t: 180 },
  { id: "assistenza-24-7", t: 240 },
  { id: "cambio-turno", t: 480 },
  { id: "operatori-oss", t: 540 },
  { id: "accompagnamento", t: 720 },
  { id: "multidisciplinare", t: 780 },
  { id: "perche", t: 840 },
  { id: "come-funziona", t: 960 },
  { id: "aree", t: 1140 },
  { id: "tariffe", t: 1200 },
  { id: "sera", t: 1260 },
  { id: "faq", t: 1320 },
  { id: "lavora-con-noi", t: 1380 },
  { id: "contatti", t: 1440 },
]

/** Ore-capitolo che fanno «respirare» la D. */
export const CHAPTER_TIMES: readonly number[] = [180, 240, 480, 540, 600, 720, 780, 840, 960, 1140, 1200, 1260, 1320, 1380, 1440]
