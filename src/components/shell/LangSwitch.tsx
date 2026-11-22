import { useTranslation } from "@/i18n/react"

/** Selettore IT/EN: due link testuali, la lingua corrente è `aria-current="page"`. Niente bandiere. */
export function LangSwitch({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  return (
    <nav className={["lang-switch", className].filter(Boolean).join(" ")} aria-label={t("language.label")}>
      <a href="/" lang="it" hrefLang="it" aria-label={t("language.switch_to_it")} aria-current={lang === "it" ? "page" : undefined}>
        IT
      </a>
      <span className="lang-switch-sep" aria-hidden="true">
        ·
      </span>
      <a href="/en/" lang="en" hrefLang="en" aria-label={t("language.switch_to_en")} aria-current={lang === "en" ? "page" : undefined}>
        EN
      </a>
    </nav>
  )
}
