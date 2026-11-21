import i18next, { type i18n } from "i18next"
import { initReactI18next } from "react-i18next"
import it from "./locales/it.json"
import en from "./locales/en.json"
import type { Lang } from "@/routes"

const resources = {
  it: { translation: it },
  en: { translation: en },
}

/** Istanza sincrona, una per render: nessun detector, nessun localStorage. */
export function createI18n(lang: Lang): i18n {
  const instance = i18next.createInstance()
  instance.use(initReactI18next).init({
    resources,
    lng: lang,
    fallbackLng: "it",
    initAsync: false,
    interpolation: { escapeValue: false },
    returnObjects: true,
  })
  return instance
}
