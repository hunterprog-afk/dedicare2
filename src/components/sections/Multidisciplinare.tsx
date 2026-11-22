import { useTranslation } from "@/i18n/react"
import { HourLabel } from "../HourLabel"
import { Picture } from "../Picture"
import { Sheet } from "../Sheet"
import { SECTIONS, sectionAttrs } from "@/content/hours"
import { Bullets, ServiceDetails } from "./parts"
import "./Day.css"

/** 11:00, approccio multidisciplinare: il foglio copre il 30% basso della foto. */
export function Multidisciplinare() {
  const { t } = useTranslation()
  const k = "servizi.items.multidisciplinare"
  return (
    <section {...sectionAttrs("multidisciplinare")} className="section">
      <div className="wrap grid12">
        <div className="pic-h233 col-span-full lg:col-[2/12] xl:col-[3/11] lg:row-start-1">
          <Picture name="giorno-piano" sizes="(min-width:1024px) 696px, 100vw" light="day" />
        </div>
        <Sheet className="multi-sheet col-span-full lg:col-[3/11] xl:col-[4/10] lg:row-start-2" data-reveal>
          <HourLabel time={SECTIONS.multidisciplinare.label} size="s" />
          <h2 className="t-h2">{t(`${k}.title`)}</h2>
          <p className="sec-body">{t(`${k}.body`)}</p>
          <Bullets items={t(`${k}.bullets`, { returnObjects: true }) as string[]} />
          <ServiceDetails text={t(`${k}.longDescription`)} />
          <p className="mt-6">
            <a className="link-text" href="#servizi">
              {t("servizi.torna_orario")}
            </a>
          </p>
        </Sheet>
      </div>
    </section>
  )
}
