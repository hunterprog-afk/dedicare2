import { useTranslation } from "react-i18next"
import { SectionPlaceholder } from "./SectionPlaceholder"

/** SEGNAPOSTO: sezione `#multidisciplinare`. Si sostituisce questo file senza toccare la composizione della pagina. */
export function Multidisciplinare() {
  const { t } = useTranslation()
  return <SectionPlaceholder id="multidisciplinare" title={t("servizi.items.multidisciplinare.title")} />
}
