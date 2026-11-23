import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import { Logo, type LogoPhase } from "./Logo"

const PHASES: LogoPhase[] = ["live", "notte", "alba", "mattino", "tramonto"]

describe("Logo", () => {
  it.each(PHASES)("si disegna con la fase %s: scritta LyzCare in testo, senza immagini", (phase) => {
    const { container } = render(<Logo phase={phase} size={36} />)
    expect(container.querySelector(".logo")).toHaveAttribute("data-phase", phase)
    expect(container.querySelector(".logo-word")).toHaveTextContent(/^LyzCare$/)
    expect(container.querySelector(".logo-word-accent")).toHaveTextContent("Care")
    expect(container.querySelector("svg")).toBeNull()
  })

  it("passa le due altezze come variabili CSS", () => {
    const { container } = render(<Logo phase="notte" size={34} sizeSm={30} />)
    const style = container.querySelector(".logo")!.getAttribute("style") ?? ""
    expect(style).toContain("--logo-h-lg: 34px")
    expect(style).toContain("--logo-h-sm: 30px")
  })
})
