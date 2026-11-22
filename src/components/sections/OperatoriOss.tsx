import { useTranslation } from "@/i18n/react"
import { HourLabel } from "../HourLabel"
import { Picture } from "../Picture"
import { SECTIONS, sectionAttrs } from "@/content/hours"
import { Bullets, ServiceDetails } from "./parts"
import "./Day.css"

/** 07:00, operatori OSS: composizione asimmetrica, la seconda foto sale sulla prima. */
export function OperatoriOss() {
  const { t } = useTranslation()
  const k = "servizi.items.oss"
  return (
    <section {...sectionAttrs("operatori-oss")} className="section">
      <div className="wrap grid12 oss">
        <div className="oss-a pic-h260 col-span-full xl:col-[1/6] xl:row-start-1">
          <HourLabel time={SECTIONS["operatori-oss"].label} size="s" />
          <Picture name="alba-persiane" sizes="(min-width:1024px) 606px, 100vw" light="day" />
        </div>
        <div className="oss-text col-span-full xl:col-[7/13] xl:row-[1/3]">
          <div className="oss-main">
            <h2 className="t-h2" data-reveal>
              {t(`${k}.title`)}
            </h2>
            <p className="sec-body">{t(`${k}.body`)}</p>
            <Bullets items={t(`${k}.bullets`, { returnObjects: true }) as string[]} />
          </div>
          <div className="oss-details">
            <ServiceDetails text={t(`${k}.longDescription`)} />
          </div>
        </div>
        <div className="oss-b pic-h233 col-span-full xl:col-[2/7] xl:row-start-2">
          <Picture name="mattino-tazza" sizes="(min-width:1024px) 426px, 100vw" light="day" objectPosition="50% 70%" />
          <HourLabel time="08:00" size="s" className="oss-b-label" />
        </div>
      </div>
    </section>
  )
}
