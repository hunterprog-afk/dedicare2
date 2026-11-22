import { useTranslation } from "react-i18next"
import { SectionPlaceholder } from "./SectionPlaceholder"

/** SEGNAPOSTO: sezione `#tariffe`. Si sostituisce questo file senza toccare la composizione della pagina. */
export function Tariffe() {
  const { t } = useTranslation()
  return <SectionPlaceholder id="tariffe" title={t("tariffario.title")} />
}
