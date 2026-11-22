import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/cn"

/** Centri delle 11 finestrelle, nello stesso ordine di `aree.comuni` (proiezione semplificata, 18 px per km). */
const POINTS: ReadonlyArray<readonly [number, number]> = [
  [285, 357],
  [348, 214],
  [320, 173],
  [409, 225],
  [285, 209],
  [276, 186],
  [403, 115],
  [74, 225],
  [394, 465],
  [486, 236],
  [432, 304],
]

interface Props {
  active: number | null
  onActive: (i: number | null) => void
}

/** Mappa stilizzata: una finestrella accesa per ogni comune, nessuna richiesta di rete. */
export function MappaMilano({ active, onActive }: Props) {
  const { t } = useTranslation()
  const ref = useRef<SVGSVGElement>(null)
  const [lit, setLit] = useState(false)

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
    <svg ref={ref} className={cn("mappa", lit && "is-lit")} viewBox="0 0 560 560" role="img" aria-label={t("aree.map_alt")}>
      <ellipse cx="285" cy="357" rx="162" ry="144" fill="none" stroke="#231C4D" strokeOpacity=".4" strokeWidth="1.5" />
      <path d="M281 380 C220 400 140 430 20 450" fill="none" stroke="#A99BF0" strokeWidth="2" />
      <path d="M290 340 C340 300 420 260 540 230" fill="none" stroke="#A99BF0" strokeWidth="2" />
      {POINTS.map(([cx, cy], i) => (
        <rect
          key={i}
          className={cn("map-window", active === i && "is-active")}
          data-comune={i}
          style={{ "--i": i } as React.CSSProperties}
          x={cx - 5}
          y={cy - 5}
          width="10"
          height="10"
          rx="1"
          onMouseEnter={() => onActive(i)}
          onMouseLeave={() => onActive(null)}
        />
      ))}
      <text x="446" y="308" fontSize="15" fontWeight="700" fill="#231C4D" fontFamily="var(--font-sans)">
        {t("aree.sede")}
      </text>
    </svg>
  )
}
