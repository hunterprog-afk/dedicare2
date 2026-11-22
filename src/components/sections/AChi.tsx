import { useTranslation } from "@/i18n/react"
import { HourLabel } from "../HourLabel"
import { Picture } from "../Picture"
import { SECTIONS, sectionAttrs } from "@/content/hours"
import { TwoLines } from "./parts"
import "./Night.css"

interface Item {
  title: string
  body: string
}

/** 22:00, «A chi»: quattro righe di testo e la foto dell'ingresso, ferma a destra. */
export function AChi() {
  const { t } = useTranslation()
  const items = t("assistiti.items", { returnObjects: true }) as Item[]
  return (
    <section {...sectionAttrs("a-chi")} className="section">
      <div className="wrap grid12 items-start">
        <div className="col-span-full lg:col-[1/7] lg:row-start-1">
          <HourLabel time={SECTIONS["a-chi"].label} size="s" />
          <p className="t-eyebrow">{t("assistiti.eyebrow")}</p>
          <h2 className="t-h2">
            <TwoLines a={t("assistiti.title_a")} b={t("assistiti.title_b")} />
          </h2>
          <p className="t-lead sec-intro">{t("assistiti.intro")}</p>
          <div className="achi-rows sec-head-gap">
            {items.map((it, i) => (
              <div key={it.title} className="achi-row" data-reveal style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}>
                <h3 className="t-h3">{it.title}</h3>
                <p className="achi-body">{it.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="achi-photo col-span-full lg:col-[8/13] lg:row-start-1">
          <Picture
            name="ingresso-turno"
            sizes="(min-width:1024px) 426px, 100vw"
            light="night"
            objectPosition="50% 66%"
          />
        </div>
      </div>
    </section>
  )
}
