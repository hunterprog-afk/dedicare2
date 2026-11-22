import { useTranslation } from "react-i18next"
import { MoonIcon, SunIcon } from "../icons"

/** Pillola dell'orologio (telefono): apre il foglio dell'indice con il `popover` nativo. */
export function ClockPill() {
  const { t } = useTranslation()
  return (
    <button type="button" className="clock-pill" popoverTarget="indice-ore" aria-label={t("ore.pill_aria", { time: "22:00" })}>
      <MoonIcon className="icon-moon" />
      <SunIcon className="icon-sun" />
      <span className="clock-time" aria-hidden="true">
        22:00
      </span>
    </button>
  )
}
