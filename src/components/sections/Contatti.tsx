import { useTranslation } from "react-i18next"
import { SectionPlaceholder } from "./SectionPlaceholder"

/** SEGNAPOSTO: sezione `#contatti`. Si sostituisce questo file senza toccare la composizione della pagina. */
export function Contatti() {
  const { t } = useTranslation()
  return <SectionPlaceholder id="contatti" title={t("contatti.title")} />
}
