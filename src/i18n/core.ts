import i18next, { type i18n } from "i18next"
import { initReactI18next } from "react-i18next"
import type { Lang } from "@/routes"

export type LocaleResources = Partial<Record<Lang, { translation: object }>>

/** Istanza sincrona, una per render: nessun detector, nessun localStorage. Le risorse arrivano da fuori. */
export function initI18n(lang: Lang, resources: LocaleResources): i18n {
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
