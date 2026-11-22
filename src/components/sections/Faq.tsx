import { useTranslation } from "react-i18next"
import { SectionPlaceholder } from "./SectionPlaceholder"

/** SEGNAPOSTO: sezione `#faq`. Si sostituisce questo file senza toccare la composizione della pagina. */
export function Faq() {
  const { t } = useTranslation()
  return <SectionPlaceholder id="faq" title={t("faq.title")} />
}
