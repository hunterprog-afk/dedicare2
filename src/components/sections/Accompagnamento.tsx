import { useTranslation } from "react-i18next"
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
        <div className="col-span-full lg:row-start-1">
          <HourLabel time={SECTIONS.accompagnamento.label} size="s" />
          <p className="t-eyebrow">{t("servizi.eyebrow")}</p>
          <h2 className="t-h2" data-reveal>
            {t(`${k}.title`)}
          </h2>
        </div>
        <div className="bleed-photo col-span-full mt-8 lg:col-[7/13] xl:col-[6/13] lg:row-start-2 lg:mt-12">
          <Picture name="mattino-accompagnamento" sizes="(min-width:1024px) 62vw, 100vw" light="day" />
        </div>
        <div className="accomp-text col-span-full lg:col-[1/6] xl:col-[1/5] lg:row-start-2">
          <p className="sec-body">{t(`${k}.body`)}</p>
          <Bullets items={t(`${k}.bullets`, { returnObjects: true }) as string[]} />
          <ServiceDetails text={t(`${k}.longDescription`)} />
        </div>
      </div>
    </section>
  )
}
