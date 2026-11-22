import { useTranslation } from "react-i18next"
import { SectionPlaceholder } from "./SectionPlaceholder"

/** SEGNAPOSTO: sezione `#servizi`. Si sostituisce questo file senza toccare la composizione della pagina. */
export function ServiziOrario() {
  const { t } = useTranslation()
  return <SectionPlaceholder id="servizi" title={t("servizi.title")} />
}
