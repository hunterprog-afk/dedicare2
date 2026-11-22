import { describe, expect, it } from "vitest"
import { renderWithI18n } from "@/test/test-utils"
import { routeFromPath } from "@/routes"
import itJson from "@/i18n/locales/it.json"
import { Home } from "./Home"

describe("Home", () => {
  it("ha il film con sette scene e poi le sette sezioni nell'ordine della specifica", () => {
    const { container } = renderWithI18n(<Home />)
    expect(container.querySelectorAll("#inizio .film-scene")).toHaveLength(7)
    const ids = [...container.querySelectorAll("main > section")].map((s) => s.id)
    expect(ids).toEqual(["inizio", "come-funziona", "per-chi", "aree", "tariffe", "faq", "lavora-con-noi", "contatti"])
  })

  it("ha un solo H1 e tutto il testo delle sette scene è nell'HTML", () => {
    const { container } = renderWithI18n(<Home />)
    expect(container.querySelectorAll("h1")).toHaveLength(1)
    expect(container.querySelector("h1")).toHaveTextContent("Quando a casa serve qualcuno.")
    const text = container.querySelector("#inizio")!.textContent ?? ""
    for (const s of itJson.film.scenes) {
      expect(text).toContain(s.title)
      expect(text).toContain(s.body)
      for (const tag of s.tags) expect(text).toContain(tag)
    }
  })

  it("ogni scena ha foto ferma con alt, poster e i clip per computer e telefono", () => {
    const { container } = renderWithI18n(<Home />)
    const scenes = [...container.querySelectorAll<HTMLElement>(".film-scene")]
    scenes.forEach((s, i) => {
      expect(s.dataset.clip).toBe(`/film/s${i + 1}.mp4`)
      expect(s.dataset.clipM).toBe(`/film/s${i + 1}-m.mp4`)
      expect(s.querySelector(".scene-foto")?.getAttribute("alt")).toBe(itJson.film.scenes[i].alt)
    })
    expect(scenes[0].querySelector(".scene-poster")).toHaveAttribute("src", "/film/s1.jpg")
  })

  it("«Di più» apre l'elenco completo del servizio con il popover nativo", () => {
    const { container } = renderWithI18n(<Home />)
    const panel = container.querySelector("#di-piu-oss")!
    expect(panel).toHaveAttribute("popover")
    expect(panel.textContent).toContain(itJson.servizi.items.oss.longDescription)
    expect(container.querySelector('[popovertarget="di-piu-oss"]')).not.toBeNull()
  })

  it("l'H1 è in italiano e in inglese", () => {
    expect(renderWithI18n(<Home />, "en").container.querySelector("h1")).toHaveTextContent("When someone is needed at home.")
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
