import { useTranslation } from "react-i18next"
import geo from "../brand/soglia-geometria.json"
import { INDEX_ENTRIES, formatHour } from "@/content/hours"

const TICKS = Array.from({ length: 25 }, (_, k) => k)

/** Binario dell'orologio (solo ≥ 1024 px): 25 tacche, 10 link-capitolo, indicatore e ora corrente. */
export function ClockRail() {
  const { t } = useTranslation()
  return (
    <nav className="clock-rail" aria-label={t("ore.titolo")}>
      <div className="clock-line" />
      {TICKS.map((k) => (
        <span key={k} className="clock-tick" style={{ top: `calc(20vh + 60vh * ${k} / 24)` }} />
      ))}
      {INDEX_ENTRIES.map((e, i) => {
        const hh = formatHour(e.t).slice(0, 2)
        return (
          <a
            key={`${e.id}-${i}`}
            className="clock-chapter"
            href={`#${e.id}`}
            data-chapter={e.id}
            aria-label={`${hh}:00, ${t(`ore.voci.${e.id}`)}`}
            style={{ top: `calc(20vh + 60vh * ${e.t / 60} / 24 - 12px)` }}
          >
            <span aria-hidden="true">{hh}</span>
          </a>
        )
      })}
      <svg className="clock-indicator" viewBox={geo.viewBox} width="12" height="14" aria-hidden="true" focusable="false">
        <path d={geo.body} fillRule="evenodd" />
      </svg>
      <span className="clock-now clock-time" aria-hidden="true">
        22:00
      </span>
    </nav>
  )
}
