import { useEffect, useRef, useState } from "react"
import { useTranslation } from "@/i18n/react"
import { cn } from "@/lib/cn"

type Side = "r" | "l" | "t" | "b"

/** Centri delle 11 finestrelle, nello stesso ordine di `aree.comuni` (proiezione semplificata, 18 px per km), con il lato dell'etichetta. */
const POINTS: ReadonlyArray<{ x: number; y: number; side: Side; always?: boolean }> = [
  { x: 285, y: 357, side: "r", always: true }, // Milano
  { x: 348, y: 214, side: "b" }, // Sesto San Giovanni
  { x: 320, y: 173, side: "t" }, // Cinisello Balsamo
  { x: 409, y: 225, side: "t" }, // Cologno Monzese
  { x: 285, y: 209, side: "l" }, // Bresso
  { x: 276, y: 186, side: "l" }, // Cusano Milanino
  { x: 403, y: 115, side: "r", always: true }, // Monza
  { x: 74, y: 225, side: "r", always: true }, // Rho
  { x: 394, y: 465, side: "r", always: true }, // San Donato Milanese
  { x: 486, y: 236, side: "b" }, // Cernusco sul Naviglio
  { x: 432, y: 304, side: "r", always: true }, // Segrate (sede)
]
const SEDE = 10
const VIEW = 560

interface Props {
  active: number | null
  onActive: (i: number | null) => void
}

/** Mappa stilizzata: una finestrella accesa per ogni comune, nessuna richiesta di rete. Le etichette sono testo HTML a 13 px fissi. */
export function MappaMilano({ active, onActive }: Props) {
  const { t } = useTranslation()
  const ref = useRef<SVGSVGElement>(null)
  const [lit, setLit] = useState(false)
  const comuni = t("aree.comuni", { returnObjects: true }) as string[]

  // Quando la mappa entra nello schermo le finestrelle si accendono una dopo l'altra (la sequenza è in CSS, solo con html.motion).
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLit(true)
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className="mappa-wrap">
      <svg ref={ref} className={cn("mappa", lit && "is-lit")} viewBox={`0 0 ${VIEW} ${VIEW}`} role="img" aria-label={t("aree.map_alt")}>
        <ellipse cx="285" cy="357" rx="162" ry="144" fill="none" stroke="#231C4D" strokeOpacity=".55" strokeWidth="1.5" />
        <path d="M281 380 C220 400 140 430 20 450" fill="none" stroke="#A99BF0" strokeWidth="2" />
        <path d="M290 340 C340 300 420 260 540 230" fill="none" stroke="#A99BF0" strokeWidth="2" />
        {POINTS.map((p, i) => (
          <rect
            key={i}
            className={cn("map-window", active === i && "is-active")}
            data-comune={i}
            style={{ "--i": i } as React.CSSProperties}
            x={p.x - 6}
            y={p.y - 6}
            width="12"
            height="12"
            rx="1"
            onMouseEnter={() => onActive(i)}
            onMouseLeave={() => onActive(null)}
          />
        ))}
      </svg>
      {POINTS.map((p, i) => {
        const name = (comuni[i] ?? "").replace(/\s*\(.*\)$/, "")
        const label = i === SEDE ? `${name} (${t("aree.sede")})` : name
        return (
          <span
            key={i}
            aria-hidden="true"
            className={cn("map-label", `map-label-${p.side}`, (p.always || active === i) && "is-shown", i === SEDE && "is-sede")}
            style={{ left: `${(p.x / VIEW) * 100}%`, top: `${(p.y / VIEW) * 100}%` }}
          >
            {label}
          </span>
        )
      })}
    </div>
  )
}
