import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import it from "./locales/it.json"
import en from "./locales/en.json"

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      it: { common: it },
      en: { common: en },
    },
    fallbackLng: "it",
    supportedLngs: ["it", "en"],
    defaultNS: "common",
    ns: ["common"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "dedicare-lang",
    },
    returnObjects: true,
  })

i18n.on("languageChanged", (lng) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng
  }
})

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language || "it"
}

export default i18n
