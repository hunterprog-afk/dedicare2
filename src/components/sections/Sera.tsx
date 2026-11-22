import { useTranslation } from "@/i18n/react"
import { HourLabel } from "../HourLabel"
import { Picture } from "../Picture"
import { SECTIONS, sectionAttrs } from "@/content/hours"
import "./Common.css"

/** 19:00, la sera: come il cambio turno, con la foto del balcone. */
export function Sera() {
  const { t } = useTranslation()
  return (
    <section {...sectionAttrs("sera")} className="stage-run stage-run-sera">
      <div className="stage-full">
        <Picture
          name="sera-balcone"
          mobileName="sera-balcone-vert"
          sizes="100vw"
          flat
          className="stage-photo sera-photo"
        />
        <div className="stage-veil" aria-hidden="true" />
        <div className="stage-text">
          <HourLabel time={SECTIONS.sera.label} size="s" />
          <h2 className="t-h2">{t("sera.title")}</h2>
        </div>
      </div>
    </section>
  )
}
