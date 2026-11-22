import { useTranslation } from "react-i18next"
import { HourLabel } from "../HourLabel"
import { Picture } from "../Picture"
import { SECTIONS, sectionAttrs } from "@/content/hours"
import "./Common.css"

/** 06:00, il cambio turno: foto a tutto schermo, testo in basso a sinistra. */
export function CambioTurno() {
  const { t } = useTranslation()
  return (
    <section {...sectionAttrs("cambio-turno")} className="stage-run">
      <div className="stage-full">
        <Picture
          name="alba-naviglio"
          mobileName="alba-naviglio-vert"
          sizes="100vw"
          flat
          className="stage-photo cambio-photo"
        />
        <div className="stage-veil" aria-hidden="true" />
        <div className="stage-text">
          <HourLabel time={SECTIONS["cambio-turno"].label} size="s" />
          <h2 className="t-h2">{t("cambio.title")}</h2>
          <p className="t-lead stage-body">{t("cambio.body")}</p>
        </div>
      </div>
    </section>
  )
}
