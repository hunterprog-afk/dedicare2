import { useTranslation } from "react-i18next"
import { SectionPlaceholder } from "./SectionPlaceholder"

/** SEGNAPOSTO: sezione `#assistenza-24-7`. Si sostituisce questo file senza toccare la composizione della pagina. */
export function Assistenza247() {
  const { t } = useTranslation()
  return <SectionPlaceholder id="assistenza-24-7" title={t("servizi.items.assistenza247.title")} />
}
