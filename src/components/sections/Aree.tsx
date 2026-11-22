import { useState } from "react"
import { useTranslation } from "react-i18next"
import { HourLabel } from "../HourLabel"
import { SECTIONS, sectionAttrs } from "@/content/hours"
import { cn } from "@/lib/cn"
import { MappaMilano } from "./MappaMilano"
import "./Day.css"

/** 17:00, aree: elenco dei comuni e mappa stilizzata, legati da uno stato condiviso. */
export function Aree() {
  const { t } = useTranslation()
  const comuni = t("aree.comuni", { returnObjects: true }) as string[]
  const [active, setActive] = useState<number | null>(null)
  return (
    <section {...sectionAttrs("aree")} className="section">
      <div className="wrap grid12 items-start">
        <div className="col-span-full lg:col-[1/6]">
          <HourLabel time={SECTIONS.aree.label} size="s" />
          <p className="t-eyebrow">{t("aree.eyebrow")}</p>
          <h2 className="t-h2">{t("aree.title")}</h2>
          <p className="sec-body">{t("aree.intro")}</p>
          <ul className="comuni sec-head-gap">
            {comuni.map((c, i) => (
              <li
                key={c}
                data-comune={i}
                className={cn(active === i && "is-active")}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="mappa-box col-span-full lg:col-[7/13]">
          <MappaMilano active={active} onActive={setActive} />
        </div>
      </div>
    </section>
  )
}
