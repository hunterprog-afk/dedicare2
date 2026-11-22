import { useTranslation } from "react-i18next"
import { INDEX_ENTRIES, formatHour } from "@/content/hours"
import { XIcon } from "../icons"
import { LangSwitch } from "./LangSwitch"

/** Foglio dell'indice (telefono): `popover` nativo, 10 righe da 56 px, selettore di lingua in fondo. */
export function HourIndex() {
  const { t } = useTranslation()
  return (
    <nav id="indice-ore" popover="auto" aria-labelledby="indice-ore-titolo">
      <div className="index-head">
        <h2 id="indice-ore-titolo" className="t-h3">
          {t("ore.titolo")}
        </h2>
        <button type="button" className="index-close" popoverTarget="indice-ore" popoverTargetAction="hide" aria-label={t("ore.chiudi")}>
          <XIcon />
        </button>
      </div>
      <ul className="index-list">
        {INDEX_ENTRIES.map((e, i) => (
          <li key={`${e.id}-${i}`}>
            <a className="index-row" href={`#${e.id}`} data-chapter={e.id}>
              <span className="t-clock">{formatHour(e.t)}</span>
              <span>{t(`ore.voci.${e.id}`)}</span>
            </a>
          </li>
        ))}
      </ul>
      <div className="index-foot">
        <LangSwitch />
      </div>
    </nav>
  )
}
