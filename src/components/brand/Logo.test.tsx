import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import { Logo, type LogoPhase } from "./Logo"

const PHASES: LogoPhase[] = ["live", "notte", "alba", "mattino", "tramonto"]

describe("Logo", () => {
  it.each(PHASES)("si disegna con la fase %s: un solo svg, 18 pareti, wordmark in testo", (phase) => {
    const { container } = render(<Logo phase={phase} size={36} />)
    expect(container.querySelectorAll("svg")).toHaveLength(1)
    const inner = container.querySelector(".logo-inner")!
    const walls = [...inner.querySelectorAll("path")].filter((p) => p.getAttribute("style")?.includes("color-mix"))
    expect(walls).toHaveLength(18)
    expect(container.querySelector(".logo")).toHaveAttribute("data-phase", phase)
    expect(container.querySelector(".logo-word")).toHaveTextContent("Dedicare")
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })

  it("due istanze hanno id diversi", () => {
    const { container } = render(
      <>
        <Logo phase="notte" size={48} />
        <Logo phase="mattino" size={48} />
      </>,
    )
    const ids = [...container.querySelectorAll("[id]")].map((e) => e.id)
    expect(ids.length).toBeGreaterThan(0)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("senza wordmark mostra solo il simbolo", () => {
    const { container } = render(<Logo phase="live" size={30} withWordmark={false} />)
    expect(container.querySelector(".logo-word")).toBeNull()
  })

  it("le pareti vanno dal 8% al 100% di mescolanza", () => {
    const { container } = render(<Logo phase="mattino" size={36} />)
    const styles = [...container.querySelectorAll(".logo-inner path")]
      .map((p) => p.getAttribute("style") ?? "")
      .filter((s) => s.includes("color-mix"))
    expect(styles[0]).toContain("8%")
    expect(styles[17]).toContain("100%")
  })
})
