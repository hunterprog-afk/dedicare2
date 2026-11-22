import { useTranslation } from "@/i18n/react"
import { HourLabel } from "../HourLabel"
import { Picture } from "../Picture"
import { SECTIONS, sectionAttrs } from "@/content/hours"
import "./Day.css"

interface Step {
  title: string
  body: string
}

/** 14:00, come funziona: quattro passi numerati, nessun tempo promesso. */
export function ComeFunziona() {
  const { t } = useTranslation()
  const steps = t("processo.items", { returnObjects: true }) as Step[]
  return (
    <section {...sectionAttrs("come-funziona")} className="section sec-clip">
      <span id="processo" aria-hidden="true" />
      <div className="wrap grid12 items-end">
        <div className="col-span-full lg:col-[1/13]">
          <HourLabel time={SECTIONS["come-funziona"].label} size="s" />
          <p className="t-eyebrow">{t("processo.eyebrow")}</p>
          <h2 className="t-h2">{t("processo.title")}</h2>
        </div>
        <ol className="passi sec-head-gap col-span-full lg:col-[1/9]">
          {steps.map((s, i) => (
            <li key={s.title} data-reveal="x">
              <span className="passo-n t-clock">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="t-h3">{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="passi-chiusura t-h3 col-span-full lg:col-[1/6]">{t("processo.chiusura")}</p>
        <div className="passi-foto col-span-full lg:col-[6/13]">
          <HourLabel time="16:00" size="s" />
          <div className="bleed-photo">
            <Picture name="giorno-gioco" sizes="(min-width:1024px) 62vw, 100vw" light="day" />
          </div>
        </div>
      </div>
    </section>
  )
}
