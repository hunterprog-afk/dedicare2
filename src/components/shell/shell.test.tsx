import { describe, expect, it } from "vitest"
import { renderWithI18n, screen, within } from "@/test/test-utils"
import { ClockRail } from "./ClockRail"
import { ClockPill } from "./ClockPill"
import { HourIndex } from "./HourIndex"
import { Header } from "./Header"
import { MobileBar } from "./MobileBar"
import { Sky } from "./Sky"
import { Disc } from "./Disc"
import { Footer } from "./Footer"

describe("guscio fisso", () => {
  it("il binario ha 25 tacche e 15 link-capitolo con aria-label «HH:00, etichetta»", () => {
    const { container } = renderWithI18n(<ClockRail />)
    expect(container.querySelectorAll(".clock-tick")).toHaveLength(25)
    const links = container.querySelectorAll<HTMLAnchorElement>("a.clock-chapter")
    expect(links).toHaveLength(15)
    expect(links[0]).toHaveAttribute("href", "#a-chi")
    expect(links[0]).toHaveAttribute("aria-label", "22:00, A chi ci rivolgiamo")
    expect(links[2]).toHaveAttribute("href", "#assistenza-24-7")
    expect(links[2]).toHaveAttribute("aria-label", "02:00, Assistenza 24/7")
    expect([...links].map((l) => l.textContent)).toEqual(["22", "01", "02", "06", "07", "10", "11", "12", "14", "17", "18", "19", "20", "21", "22"])
    expect(links[4]).toHaveAttribute("aria-label", "07:00, Operatori OSS")
    expect(container.querySelector(".clock-now")).toHaveTextContent("22:00")
  })

  it("la pillola apre il foglio con il popover nativo", () => {
    renderWithI18n(<ClockPill />)
    const pill = screen.getByRole("button")
    expect(pill).toHaveAttribute("popovertarget", "indice-ore")
    expect(pill).toHaveAttribute("aria-label", "Le ore del turno: apri l'indice. Sono le 22:00.")
  })

  it("il foglio ha 15 righe, il bottone chiudi e il selettore di lingua", () => {
    const { container } = renderWithI18n(<HourIndex />)
    const nav = container.querySelector("#indice-ore")!
    expect(nav).toHaveAttribute("popover")
    expect(nav).toHaveAttribute("aria-labelledby", "indice-ore-titolo")
    expect(nav.querySelectorAll("a.index-row")).toHaveLength(15)
    const close = within(nav as HTMLElement).getByRole("button", { name: "Chiudi", hidden: true })
    expect(close).toHaveAttribute("popovertargetaction", "hide")
    expect(within(nav as HTMLElement).getByRole("navigation", { name: "Lingua", hidden: true })).toBeInTheDocument()
  })

  it("l'header IT ha logo, selettore, Chiama e pillola; la lingua corrente è aria-current", () => {
    const { container } = renderWithI18n(<Header />)
    expect(screen.getByRole("link", { name: "Chiama Dedicare Solutions al +39 388 253 6992" })).toHaveAttribute("href", "tel:+393882536992")
    expect(container.querySelector(".clock-pill")).not.toBeNull()
    expect(container.querySelector('.lang-switch a[lang="it"]')).toHaveAttribute("aria-current", "page")
    expect(container.querySelector('.lang-switch a[lang="en"]')).not.toHaveAttribute("aria-current")
  })

  it("l'header delle legali ha il logo fermo Mattino e il link EN", () => {
    const { container } = renderWithI18n(<Header variant="legal" />)
    expect(container.querySelector(".logo")).toHaveAttribute("data-phase", "mattino")
    expect(container.querySelector("header")).toHaveClass("is-solid")
    expect(container.querySelector('a[href="/en/"]')).not.toBeNull()
    expect(container.querySelector(".clock-pill")).toBeNull()
  })

  it("i tre selettori di lingua hanno nomi di landmark diversi e il foglio non ha titoli", () => {
    const { container } = renderWithI18n(
      <>
        <Header />
        <HourIndex />
        <Footer />
      </>,
    )
    const names = [...container.querySelectorAll("nav.lang-switch")].map((n) => n.getAttribute("aria-label"))
    expect(names).toEqual(["Lingua del sito", "Lingua", "Lingua, a fondo pagina"])
    expect(new Set(names).size).toBe(3)
    // Il foglio dell'indice precede l'h1 nel DOM: il suo titolo non è un'intestazione.
    expect(container.querySelector("#indice-ore h1, #indice-ore h2, #indice-ore h3")).toBeNull()
    expect(container.querySelector("#indice-ore-titolo")).toHaveTextContent("Le ore del turno")
  })

  it("la barra contatti ha Chiama e WhatsApp con il testo precompilato", () => {
    renderWithI18n(<MobileBar />)
    const wa = screen.getByRole("link", { name: /WhatsApp/ })
    expect(wa.getAttribute("href")).toBe(
      "https://wa.me/393882536992?text=" +
        encodeURIComponent("Buongiorno, vorrei informazioni sui servizi di assistenza domiciliare di Dedicare Solutions."),
    )
    expect(wa).toHaveAttribute("target", "_blank")
    expect(wa).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("cielo e disco hanno gli strati della meccanica", () => {
    const sky = renderWithI18n(<Sky />)
    expect(sky.container.querySelectorAll(".sky-layer")).toHaveLength(7)
    expect(sky.container.querySelector(".sky-grain")).not.toBeNull()
    sky.unmount()
    const disc = renderWithI18n(<Disc />)
    expect(disc.container.querySelector(".disc-moon")).not.toBeNull()
    expect(disc.container.querySelector(".disc-sun")).not.toBeNull()
  })
})
