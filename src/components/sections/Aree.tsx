import { useTranslation } from "react-i18next"
import { SectionPlaceholder } from "./SectionPlaceholder"

/** SEGNAPOSTO: sezione `#aree`. Si sostituisce questo file senza toccare la composizione della pagina. */
export function Aree() {
  const { t } = useTranslation()
  return <SectionPlaceholder id="aree" title={t("aree.title")} />
}
