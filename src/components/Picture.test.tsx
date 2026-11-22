import { describe, expect, it } from "vitest"
import { renderWithI18n, screen } from "@/test/test-utils"
import { PHOTOS, PLACEHOLDER_BG } from "@/content/images"
import { Picture } from "./Picture"

describe("Picture", () => {
  it("senza la foto nel manifest mostra un segnaposto con il box delle misure giuste e l'alt", () => {
    const { container } = renderWithI18n(<Picture name="notte-lampada" sizes="100vw" />)
    const box = container.querySelector(".pic") as HTMLElement
    expect(box.style.aspectRatio.replace(/\s/g, "")).toBe("1536/1024")
    const ph = screen.getByRole("img", { name: /mano sistema la coperta/ })
    expect(ph.className).toContain("pic-skeleton")
    expect(ph.getAttribute("style")).toContain("linear-gradient")
  })

  it("la foto verticale ha il box 2:3", () => {
    const { container } = renderWithI18n(<Picture name="ingresso-turno" sizes="100vw" />)
    expect((container.querySelector(".pic") as HTMLElement).style.aspectRatio.replace(/\s/g, "")).toBe("1024/1536")
  })

  it("con `light` aggiunge il velo e il tono", () => {
    const { container } = renderWithI18n(<Picture name="mattino-tazza" sizes="100vw" light="day" />)
    expect(container.querySelector(".pic")).toHaveAttribute("data-light", "day")
    expect(container.querySelector(".veil[data-light-veil]")).not.toBeNull()
  })

  it("l'alt segue la lingua", () => {
    renderWithI18n(<Picture name="sera-balcone" sizes="100vw" />, "en")
    expect(screen.getByRole("img", { name: /open window onto a balcony/ })).toBeInTheDocument()
  })

  it("le 15 foto della specifica hanno un gradiente di segnaposto e un alt in entrambe le lingue", () => {
    expect(PHOTOS).toHaveLength(15)
    for (const p of PHOTOS) {
      expect(PLACEHOLDER_BG[p.fase]).toContain("linear-gradient")
      for (const lang of ["it", "en"] as const) {
        const { unmount } = renderWithI18n(<Picture name={p.name} sizes="100vw" />, lang)
        expect(screen.getByRole("img").getAttribute("aria-label")).toMatch(/\S{3}/)
        unmount()
      }
    }
  })
})
