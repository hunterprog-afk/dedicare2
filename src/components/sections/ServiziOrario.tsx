import { useTranslation } from "@/i18n/react"
import { HourLabel } from "../HourLabel"
import { SECTIONS, sectionAttrs } from "@/content/hours"
import "./Night.css"

const ROWS = [
  { time: "02:00", key: "assistenza247", href: "#assistenza-24-7" },
  { time: "08:00", key: "oss", href: "#operatori-oss" },
  { time: "10:00", key: "accompagnamento", href: "#accompagnamento" },
  { time: "11:00", key: "multidisciplinare", href: "#multidisciplinare" },
] as const

/** 01:00, l'orario dei servizi: quattro righe-link, ognuna con la sua ora del giorno. */
export function ServiziOrario() {
  const { t } = useTranslation()
  return (
    <section {...sectionAttrs("servizi")} className="section servizi-sec">
      <div className="wrap grid12">
        <div className="col-span-full lg:col-[1/9]">
          <HourLabel time={SECTIONS.servizi.label} size="s" />
          <p className="t-eyebrow">{t("servizi.eyebrow")}</p>
          <h2 className="t-h2">{t("servizi.title")}</h2>
        </div>
        <p className="t-lead sec-intro col-span-full lg:col-[1/8]">{t("servizi.intro")}</p>
        <p className="orario-note col-span-full lg:col-[1/9]">{t("servizi.orario_nota")}</p>
        <ol className="orario col-span-full lg:col-[1/9]">
          {ROWS.map((r) => (
            <li key={r.key}>
              <a href={r.href}>
                <span className="orario-hour t-clock">{r.time}</span>
                <span className="orario-title t-h3">{t(`servizi.items.${r.key}.title`)}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
