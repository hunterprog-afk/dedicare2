import { useTranslation } from "react-i18next"
import { SectionPlaceholder } from "./SectionPlaceholder"

/** SEGNAPOSTO: sezione `#perche`. Si sostituisce questo file senza toccare la composizione della pagina. */
export function Perche() {
  const { t } = useTranslation()
  return <SectionPlaceholder id="perche" title={<>{t("perche.title_a")}<br />{t("perche.title_b")}</>} legacyAnchor="filosofia" />
}
