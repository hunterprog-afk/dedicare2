import { useTranslation } from "react-i18next"
import { SectionPlaceholder } from "./SectionPlaceholder"

/** SEGNAPOSTO: sezione `#a-chi`. Si sostituisce questo file senza toccare la composizione della pagina. */
export function AChi() {
  const { t } = useTranslation()
  return <SectionPlaceholder id="a-chi" title={<>{t("assistiti.title_a")}<br />{t("assistiti.title_b")}</>} />
}
