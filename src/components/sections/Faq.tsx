import { useTranslation } from "@/i18n/react"
import { HourLabel } from "../HourLabel"
import { PlusIcon } from "../icons"
import { SECTIONS, sectionAttrs } from "@/content/hours"
import "./Common.css"
import "./Night.css"

interface Item {
  q: string
  a: string
}

/** 20:00, domande frequenti: `<details>` nativi, più risposte aperte insieme, nessuna animazione sul testo. */
export function Faq() {
  const { t } = useTranslation()
  const items = t("faq.items", { returnObjects: true }) as Item[]
  return (
    <section {...sectionAttrs("faq")} className="section">
      <div className="wrap grid12 items-start">
        <div className="faq-side col-span-full lg:col-[1/5]">
          <HourLabel time={SECTIONS.faq.label} size="s" />
          <p className="t-eyebrow">{t("faq.eyebrow")}</p>
          <h2 className="t-h2">{t("faq.title")}</h2>
          <p className="sec-body">{t("faq.intro")}</p>
          <p className="mt-6">
            <a className="link-text" href="#contatti">
              {t("faq.cta")}
            </a>
          </p>
        </div>
        <div className="col-span-full lg:col-[6/13]">
          {items.map((it) => (
            <details key={it.q} className="faq-item">
              <summary>
                <span className="faq-q">{it.q}</span>
                <PlusIcon />
              </summary>
              <div className="faq-a">
                <p>{it.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
