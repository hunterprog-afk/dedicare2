import { useTranslation } from "react-i18next"
import { SectionPlaceholder } from "./SectionPlaceholder"

/** SEGNAPOSTO: sezione `#come-funziona`. Si sostituisce questo file senza toccare la composizione della pagina. */
export function ComeFunziona() {
  const { t } = useTranslation()
  return <SectionPlaceholder id="come-funziona" title={t("processo.title")} legacyAnchor="processo" />
}
