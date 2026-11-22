import { useTranslation } from "@/i18n/react"
import { Logo } from "../brand/Logo"
import { PhoneIcon } from "../icons"
import { PHONE_HREF } from "@/content/contacts"
import { ClockPill } from "./ClockPill"
import { LangSwitch } from "./LangSwitch"

interface HeaderProps {
  /** `legal`: pagine legali, logo fermo «Mattino», fondo sempre pieno, solo link EN e Chiama. */
  variant?: "home" | "legal"
}

export function Header({ variant = "home" }: HeaderProps) {
  const { t } = useTranslation()
  const legal = variant === "legal"
  return (
    <header role="banner" className={legal ? "site-header site-header-legal is-solid" : "site-header"}>
      <a className="site-header-logo" href={legal ? "/" : "#inizio"} aria-label={t("nav.logo_aria")}>
        <Logo phase={legal ? "mattino" : "live"} size={36} sizeSm={30} className="logo-header" />
      </a>
      <div className="site-header-end">
        {legal ? (
          <a className="lang-switch lang-switch-single" href="/en/" lang="en" hrefLang="en" aria-label={t("language.switch_to_en")}>
            EN
          </a>
        ) : (
          <LangSwitch place="header" />
        )}
        <a className="header-call" href={PHONE_HREF} aria-label={t("nav.chiama_aria")}>
          <PhoneIcon />
          {t("nav.chiama")}
        </a>
        {!legal && <ClockPill />}
      </div>
    </header>
  )
}
