// LOGO PROVVISORIO: simbolo "La soglia" in attesa della scelta definitiva. Per sostituirlo basta cambiare questo file.
import { useId } from "react"
import geo from "./soglia-geometria.json"
import { cn } from "@/lib/cn"

export type LogoPhase = "live" | "notte" | "alba" | "mattino" | "tramonto"

/** Percentuale di `--d-in-bottom` per ciascuna delle 18 pareti, dal fronte al fondo. */
const P = Array.from({ length: 18 }, (_, i) => Math.round(8 + 92 * Math.pow(i / 17, 0.9)))

interface LogoProps {
  phase: LogoPhase
  /** Altezza del simbolo in px (da 1024 px in su). */
  size: number
  /** Altezza sotto 1024 px, se diversa. */
  sizeSm?: number
  withWordmark?: boolean
  className?: string
}

export function Logo({ phase, size, sizeSm, withWordmark = true, className }: LogoProps) {
  const uid = useId().replace(/:/g, "")
  return (
    <span className={cn("logo", className)} data-phase={phase} style={{ "--logo-h-lg": `${size}px`, "--logo-h-sm": `${sizeSm ?? size}px` } as React.CSSProperties}>
      <svg viewBox={geo.viewBox} width={(size * 330) / 384} height={size} style={{ width: "calc(var(--logo-h) * 330 / 384)", height: "var(--logo-h)" }} aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={`${uid}-c`}>
            <path d={geo.inner} />
          </clipPath>
          <linearGradient id={`${uid}-sky`} gradientUnits="userSpaceOnUse" x1="0" y1={geo.backY[0]} x2="0" y2={geo.backY[1]}>
            <stop offset="0" style={{ stopColor: "var(--d-in-top)" }} />
            <stop offset="1" style={{ stopColor: "var(--d-in-bottom)" }} />
          </linearGradient>
          <radialGradient id={`${uid}-glow`} gradientUnits="userSpaceOnUse" cx={geo.glow[0]} cy={geo.glow[1]} r={geo.glow[2]}>
            <stop offset="0" stopColor="#FFF4EF" stopOpacity=".9" />
            <stop offset="1" stopColor="#FFF4EF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d={geo.body} fillRule="evenodd" style={{ fill: "var(--d-body)" }} />
        <g clipPath={`url(#${uid}-c)`}>
          <g className="logo-inner">
            {geo.walls.map((d, i) => (
              <path key={i} d={d} style={{ fill: `color-mix(in oklab, var(--d-in-bottom) ${P[i]}%, var(--d-body))` }} />
            ))}
            <path d={geo.back} fill={`url(#${uid}-sky)`} />
            <path d={geo.back} fill={`url(#${uid}-glow)`} />
          </g>
        </g>
      </svg>
      {withWordmark && <span className="logo-word">Dedicare</span>}
    </span>
  )
}
