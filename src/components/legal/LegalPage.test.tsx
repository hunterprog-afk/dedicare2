import { describe, expect, it } from "vitest"
import { renderWithI18n, screen } from "@/test/test-utils"
import { LegalPage, type LegalKind } from "./LegalPage"
import { Footer } from "../shell/Footer"
import * as legal from "@/content/legal"

const norm = (s: string) => s.replace(/\s+/g, " ").trim()

const CASES: [LegalKind, { title: string; sections: readonly { heading: string; content: string }[] }][] = [
  ["privacy", legal.privacyPolicy],
  ["cookie", legal.cookiePolicy],
  ["note-legali", legal.noteLegali],
]

describe("LegalPage", () => {
  it.each(CASES)("%s: ogni frase di legal.ts è nel testo visibile", (kind, doc) => {
    const { container } = renderWithI18n(<LegalPage kind={kind} />)
    const text = norm(container.querySelector("main")!.textContent ?? "")
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(doc.title)
    for (const s of doc.sections) {
      expect(text).toContain(norm(s.heading))
      for (const line of s.content.split("\n").filter(Boolean)) {
        expect(text, line.slice(0, 60)).toContain(norm(line.replace(/^• /, "")))
      }
    }
  })

  it("le liste con «• » diventano <ul>, senza il pallino nel testo", () => {
    const { container } = renderWithI18n(<LegalPage kind="privacy" />)
    expect(container.querySelectorAll("main ul li").length).toBeGreaterThan(10)
    expect(container.querySelector("main")!.textContent).not.toContain("• ")
  })

  it("/privacy/ porta la versione dell'informativa; nessuna sezione Trasparenza", () => {
    const { container } = renderWithI18n(<LegalPage kind="privacy" />)
    expect(container.textContent).toContain("privacy-policy-2026-10")
    expect("trasparenza" in legal).toBe(false)
    expect(container.textContent).not.toMatch(/Trasparenza/)
  })

  it("e-mail e PEC restano testo, non diventano link", () => {
    const { container } = renderWithI18n(<LegalPage kind="note-legali" />)
    expect(container.querySelectorAll("main a[href^='mailto:']").length).toBe(0)
  })
})

describe("Footer", () => {
  it("IT: tre link legali, recapiti, nessun link Trasparenza", () => {
    renderWithI18n(<Footer />)
    const nav = screen.getByRole("navigation", { name: "Note legali e contatti" })
    const links = Array.from(nav.querySelectorAll("a")).map((a) => [a.textContent, a.getAttribute("href")])
    expect(links).toEqual([
      ["Privacy Policy", "/privacy/"],
      ["Cookie Policy", "/cookie/"],
      ["Note Legali", "/note-legali/"],
    ])
    expect(screen.getByRole("link", { name: "+39 388 253 6992" })).toHaveAttribute("href", "tel:+393882536992")
    expect(screen.getByRole("link", { name: "info@dedicaresolutions.it" })).toHaveAttribute("href", "mailto:info@dedicaresolutions.it")
    expect(document.body.textContent).not.toMatch(/Trasparenza/i)
  })

  it("EN: le etichette legali dicono «in italiano» e hanno hreflang it", () => {
    renderWithI18n(<Footer />, "en")
    const link = screen.getByRole("link", { name: /Privacy Policy/ })
    expect(link).toHaveTextContent("(in Italian)")
    expect(link).toHaveAttribute("hreflang", "it")
  })
})
