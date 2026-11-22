import { useTranslation } from "react-i18next"
import { SectionPlaceholder } from "./SectionPlaceholder"

/** SEGNAPOSTO: sezione `#accompagnamento`. Si sostituisce questo file senza toccare la composizione della pagina. */
export function Accompagnamento() {
  const { t } = useTranslation()
  return <SectionPlaceholder id="accompagnamento" title={t("servizi.items.accompagnamento.title")} />
}
