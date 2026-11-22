import { useTranslation } from "react-i18next"
import { SectionPlaceholder } from "./SectionPlaceholder"

/** SEGNAPOSTO: sezione `#lavora-con-noi`. Si sostituisce questo file senza toccare la composizione della pagina. */
export function LavoraConNoi() {
  const { t } = useTranslation()
  return <SectionPlaceholder id="lavora-con-noi" title={t("curriculum.title")} />
}
