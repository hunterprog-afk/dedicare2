import { describe, expect, it } from "vitest"
import { renderWithI18n } from "@/test/test-utils"
import { SECTIONS, INDEX_ENTRIES, formatHour } from "@/content/hours"
import { routeFromPath } from "@/routes"
import { Home } from "./Home"

const ORDER = [
  "inizio",
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
]

describe("Home", () => {
  it("monta le 16 sezioni nell'ordine della specifica con id, tono, banda e ore", () => {
    const { container } = renderWithI18n(<Home />)
    const sections = [...container.querySelectorAll("main > section")]
    expect(sections.map((s) => s.id)).toEqual(ORDER)
    for (const s of sections) {
      const def = SECTIONS[s.id as keyof typeof SECTIONS]
      expect(s).toHaveAttribute("data-tone", def.tone)
      expect(s).toHaveAttribute("data-band", def.band)
      expect(s).toHaveAttribute("data-label-hour", def.label)
    }
    expect(container.querySelector("#assistenza-24-7")).toHaveAttribute("data-hour", "210,450")
    expect(container.querySelector("#cambio-turno")).toHaveAttribute("data-phase-switch", "light")
    expect(container.querySelector("#sera")).toHaveAttribute("data-phase-switch", "dark")
  })

  it("ha un solo H1, le vecchie ancore vuote e la finestra a D", () => {
    const { container } = renderWithI18n(<Home />)
    expect(container.querySelectorAll("h1")).toHaveLength(1)
    expect(container.querySelector("span#filosofia")).not.toBeNull()
    expect(container.querySelector("span#processo")).not.toBeNull()
    expect(container.querySelector("clipPath#d-window")).toHaveAttribute("clipPathUnits", "objectBoundingBox")
    expect(container.querySelector("footer")).not.toBeNull()
  })

  it("l'H1 dell'hero è nel testo, in italiano e in inglese", () => {
    expect(renderWithI18n(<Home />).container.querySelector("h1")).toHaveTextContent("Assistenza a casa, di giorno e di notte.")
    const en = renderWithI18n(<Home />, "en")
    expect(en.container.querySelector("h1")).toHaveTextContent("Home care, by day and by night.")
  })
})

describe("ore", () => {
  it("l'ora mostrata è (1320 + t) mod 1440", () => {
    expect(formatHour(0)).toBe("22:00")
    expect(formatHour(180)).toBe("01:00")
    expect(formatHour(240)).toBe("02:00")
    expect(formatHour(480)).toBe("06:00")
    expect(formatHour(1440)).toBe("22:00")
    expect(formatHour(1260)).toBe("19:00")
  })
  it("le 10 voci dell'indice hanno le ore della specifica", () => {
    expect(INDEX_ENTRIES.map((e) => formatHour(e.t))).toEqual(["22:00", "01:00", "02:00", "12:00", "14:00", "17:00", "18:00", "20:00", "21:00", "22:00"])
  })
})

describe("rotte", () => {
  it("normalizza la barra finale e ripiega sulla home italiana", () => {
    expect(routeFromPath("/")).toBe("home-it")
    expect(routeFromPath("/en")).toBe("home-en")
    expect(routeFromPath("/privacy")).toBe("privacy")
    expect(routeFromPath("/note-legali/")).toBe("note-legali")
    expect(routeFromPath("/boh")).toBe("home-it")
  })
})
