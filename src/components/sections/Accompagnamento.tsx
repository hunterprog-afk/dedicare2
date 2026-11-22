import { useTranslation } from "@/i18n/react"
import { HourLabel } from "../HourLabel"
import { Picture } from "../Picture"
import { SECTIONS, sectionAttrs } from "@/content/hours"
import { Bullets, ServiceDetails } from "./parts"
import "./Day.css"

/** 10:00, accompagnamento: foto al vivo che rompe la colonna a destra. */
export function Accompagnamento() {
  const { t } = useTranslation()
  const k = "servizi.items.accompagnamento"
  return (
    <section {...sectionAttrs("accompagnamento")} className="section sec-clip">
      <div className="wrap grid12 items-start">
        <div className="col-span-full xl:row-start-1">
          <HourLabel time={SECTIONS.accompagnamento.label} size="s" />
          <h2 className="t-h2" data-reveal>
            {t(`${k}.title`)}
          </h2>
        </div>
        <div className="bleed-photo bleed-photo-accomp col-span-full mt-8 lg:mt-12 xl:col-[8/13] xl:row-start-2">
          <Picture name="mattino-accompagnamento" sizes="(min-width:1024px) 62vw, 100vw" light="day" />
        </div>
        <div className="accomp-text col-span-full xl:col-[1/7] xl:row-start-2">
          <p className="sec-body">{t(`${k}.body`)}</p>
          <Bullets items={t(`${k}.bullets`, { returnObjects: true }) as string[]} />
          <ServiceDetails text={t(`${k}.longDescription`)} />
        </div>
      </div>
    </section>
  )
}
