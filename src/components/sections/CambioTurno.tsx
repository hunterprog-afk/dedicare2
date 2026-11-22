import { useTranslation } from "react-i18next"
import { SectionPlaceholder } from "./SectionPlaceholder"

/** SEGNAPOSTO: sezione `#cambio-turno`. Si sostituisce questo file senza toccare la composizione della pagina. */
export function CambioTurno() {
  const { t } = useTranslation()
  return <SectionPlaceholder id="cambio-turno" title={t("cambio.title")} />
}
