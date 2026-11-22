import { useTranslation } from "react-i18next"
import { SectionPlaceholder } from "./SectionPlaceholder"

/** SEGNAPOSTO: sezione `#sera`. Si sostituisce questo file senza toccare la composizione della pagina. */
export function Sera() {
  const { t } = useTranslation()
  return <SectionPlaceholder id="sera" title={t("sera.title")} />
}
