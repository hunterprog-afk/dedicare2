// LOGO PROVVISORIO: scritta «LyzCare» in Big Shoulders, in attesa della scelta del logo definitivo. Per sostituirlo basta cambiare questo file.
import { cn } from "@/lib/cn"

export type LogoPhase = "live" | "notte" | "alba" | "mattino" | "tramonto"

interface LogoProps {
  phase: LogoPhase
  /** Altezza della scritta in px (da 1024 px in su). */
  size: number
  /** Altezza sotto 1024 px, se diversa. */
  sizeSm?: number
  className?: string
}

export function Logo({ phase, size, sizeSm, className }: LogoProps) {
  return (
    <span className={cn("logo", className)} data-phase={phase} style={{ "--logo-h-lg": `${size}px`, "--logo-h-sm": `${sizeSm ?? size}px` } as React.CSSProperties}>
      <span className="logo-word" translate="no">
        Lyz<span className="logo-word-accent">Care</span>
      </span>
    </span>
  )
}
