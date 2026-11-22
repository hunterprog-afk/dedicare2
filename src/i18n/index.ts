import it from "./locales/it.json"
import en from "./locales/en.json"
import { initI18n } from "./core"
import type { I18n } from "./react"
import type { Lang } from "@/routes"

/** Entrambe le lingue: per il pre-render e per i test. Il client carica solo la lingua della pagina (entry-client). */
export function createI18n(lang: Lang): I18n {
  return initI18n(lang, { it: { translation: it }, en: { translation: en } })
}
