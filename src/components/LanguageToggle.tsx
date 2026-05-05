import { useTranslation } from "react-i18next"

export function LanguageToggle() {
  const { i18n, t } = useTranslation()
  const current = (i18n.resolvedLanguage || i18n.language || "it").slice(0, 2)
  const isIt = current === "it"
  const next = isIt ? "en" : "it"
  const label = isIt ? t("language.switch_to_en") : t("language.switch_to_it")

  return (
    <button
      type="button"
      onClick={() => {
        void i18n.changeLanguage(next)
      }}
      aria-label={label}
      title={label}
      className="rounded-full h-9 px-3 flex items-center justify-center text-white bg-white/10 hover:bg-white/18 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 font-body text-xs uppercase tracking-wider"
    >
      {isIt ? "IT" : "EN"}
    </button>
  )
}
