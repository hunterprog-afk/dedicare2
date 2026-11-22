import { describe, expect, it, vi } from "vitest"
import { renderWithI18n, screen } from "@/test/test-utils"
import { PHOTOS, PLACEHOLDER_BG } from "@/content/images"
import { Picture } from "./Picture"

// Il manifest reale dipende dalle foto ottimizzate: qui lo si controlla a mano per provare entrambi i rami.
const manifest = vi.hoisted(() => ({}) as Record<string, { w: number; h: number; widths: number[] }>)
vi.mock("@/content/images.generated.json", () => ({ default: manifest }))

const withoutPhotos = () => {
  for (const k of Object.keys(manifest)) delete manifest[k]
}

describe("Picture senza foto nel manifest", () => {
  it("mostra un segnaposto con il box delle misure giuste e l'alt", () => {
    withoutPhotos()
    const { container } = renderWithI18n(<Picture name="notte-lampada" sizes="100vw" />)
    const box = container.querySelector(".pic") as HTMLElement
    expect(box.style.aspectRatio.replace(/\s/g, "")).toBe("1536/1024")
    const ph = screen.getByRole("img", { name: /mano sistema una coperta/ })
    expect(ph.className).toContain("pic-skeleton")
    expect(ph.getAttribute("style")).toContain("linear-gradient")
  })

  it("la foto verticale ha il box 2:3", () => {
    withoutPhotos()
    const { container } = renderWithI18n(<Picture name="ingresso-turno" sizes="100vw" />)
    expect((container.querySelector(".pic") as HTMLElement).style.aspectRatio.replace(/\s/g, "")).toBe("1024/1536")
  })

  it("con `light` aggiunge il velo e il tono", () => {
    withoutPhotos()
    const { container } = renderWithI18n(<Picture name="mattino-tazza" sizes="100vw" light="day" />)
    expect(container.querySelector(".pic")).toHaveAttribute("data-light", "day")
    expect(container.querySelector(".veil[data-light-veil]")).not.toBeNull()
  })

  it("l'alt segue la lingua", () => {
    withoutPhotos()
    renderWithI18n(<Picture name="sera-balcone" sizes="100vw" />, "en")
    expect(screen.getByRole("img", { name: /open window overlooks geraniums/ })).toBeInTheDocument()
  })

  it("le 15 foto della specifica hanno un gradiente di segnaposto e un alt di al più 15 parole in entrambe le lingue", () => {
    withoutPhotos()
    expect(PHOTOS).toHaveLength(15)
    for (const p of PHOTOS) {
      expect(PLACEHOLDER_BG[p.fase]).toContain("linear-gradient")
      for (const lang of ["it", "en"] as const) {
        const { unmount } = renderWithI18n(<Picture name={p.name} sizes="100vw" />, lang)
        const alt = screen.getByRole("img").getAttribute("aria-label") ?? ""
        expect(alt).toMatch(/\S{3}/)
        expect(alt.trim().split(/\s+/).length).toBeLessThanOrEqual(15)
        unmount()
      }
    }
  })
})

describe("Picture con la foto nel manifest", () => {
  it("scrive AVIF e WebP con le larghezze del manifest, l'alt e la priorità dell'hero", () => {
    withoutPhotos()
    manifest["notte-finestra-orizz"] = { w: 1536, h: 1024, widths: [640, 960, 1440, 1536] }
    manifest["notte-finestra-vert"] = { w: 1024, h: 1536, widths: [640, 1024] }
    const { container } = renderWithI18n(
      <Picture name="notte-finestra-orizz" mobileName="notte-finestra-vert" sizes="100vw" priority objectPosition="0% 30%" />,
    )
    const sources = [...container.querySelectorAll("source")]
    expect(sources).toHaveLength(4)
    expect(sources[0].getAttribute("media")).toBe("(max-width: 639px)")
    expect(sources[0].getAttribute("srcset")).toBe("/img/notte-finestra-vert-640.avif 640w, /img/notte-finestra-vert-1024.avif 1024w")
    expect(sources[2].getAttribute("srcset")).toContain("/img/notte-finestra-orizz-1440.avif 1440w")
    const img = screen.getByRole("img", { name: /finestra illuminata da una lampada ambrata/ })
    expect(img.getAttribute("src")).toBe("/img/notte-finestra-orizz-1536.webp")
    expect(img.getAttribute("loading")).toBe("eager")
    expect(img.getAttribute("fetchpriority")).toBe("high")
    expect(img.getAttribute("style")).toContain("object-position: 0% 30%")
    withoutPhotos()
  })
})
