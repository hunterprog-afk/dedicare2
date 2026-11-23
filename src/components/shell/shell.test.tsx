import { describe, expect, it } from "vitest"
import { renderWithI18n, screen } from "@/test/test-utils"
import { Header } from "./Header"
import { MobileBar } from "./MobileBar"
import { Footer } from "./Footer"
import { setHour } from "@/film/hourRoll"

describe("guscio fisso", () => {
  it("l'intestazione ha logo, ora della scena, selettore e Chiama; la lingua corrente è aria-current", () => {
    const { container } = renderWithI18n(<Header />)
    expect(screen.getByRole("link", { name: "Chiama LyzCare al +39 388 253 6992" })).toHaveAttribute("href", "tel:+393882536992")
    expect(container.querySelector(".pill")).not.toBeNull()
    expect(container.querySelector("[data-film-hour]")).toHaveTextContent("22:00")
    expect(container.querySelector('.lang-switch a[lang="it"]')).toHaveAttribute("aria-current", "page")
    expect(container.querySelector('.lang-switch a[lang="en"]')).not.toHaveAttribute("aria-current")
  })

  it("l'intestazione delle legali non ha l'ora e ha il link EN", () => {
    const { container } = renderWithI18n(<Header variant="legal" />)
    expect(container.querySelector("[data-film-hour]")).toBeNull()
    expect(container.querySelector('a[href="/en/"]')).not.toBeNull()
  })

  it("i selettori di lingua hanno nomi di landmark diversi", () => {
    const { container } = renderWithI18n(
      <>
        <Header />
        <Footer />
      </>,
    )
    const names = [...container.querySelectorAll("nav.lang-switch")].map((n) => n.getAttribute("aria-label"))
    expect(names).toEqual(["Lingua del sito", "Lingua, a fondo pagina"])
  })

  it("la barra del telefono ha Chiama e WhatsApp con il testo precompilato", () => {
    renderWithI18n(<MobileBar />)
    const wa = screen.getByRole("link", { name: /WhatsApp/ })
    expect(wa.getAttribute("href")).toBe(
      "https://wa.me/393882536992?text=" +
        encodeURIComponent("Buongiorno, vorrei informazioni sui servizi di assistenza domiciliare di LyzCare."),
    )
    expect(wa).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("il rullo cambia solo le cifre diverse", () => {
    const { container } = renderWithI18n(<Header />)
    const host = container.querySelector<HTMLElement>("[data-film-hour]")!
    setHour(host, "02:00", false)
    expect(host.dataset.filmHour).toBe("02:00")
    expect(host.textContent).toBe("02:00")
  })
})
