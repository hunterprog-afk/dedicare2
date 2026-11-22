import { useTranslation } from "react-i18next"
import { SectionPlaceholder } from "./SectionPlaceholder"

/** SEGNAPOSTO: sezione `#operatori-oss`. Si sostituisce questo file senza toccare la composizione della pagina. */
export function OperatoriOss() {
  const { t } = useTranslation()
  return <SectionPlaceholder id="operatori-oss" title={t("servizi.items.oss.title")} />
}
