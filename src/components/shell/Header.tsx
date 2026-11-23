import { useTranslation } from "@/i18n/react"
import { Logo } from "../brand/Logo"
import { PhoneIcon } from "../icons"
import { PHONE_HREF } from "@/content/contacts"
import { HourRoll } from "./HourRoll"
import { LangSwitch } from "./LangSwitch"

interface HeaderProps {
  /** `legal`: pagine legali, senza l'ora del film, solo link EN e Chiama. */
  variant?: "home" | "legal"
}

/** Pillola flottante in vetro: logo a sinistra, ora della scena al centro, «Chiama» a destra. */
export function Header({ variant = "home" }: HeaderProps) {
  const { t } = useTranslation()
  const legal = variant === "legal"
  return (
    <header role="banner" className={legal ? "site-header site-header-legal" : "site-header"}>
      <div className="pill">
        <a className="pill-logo" href={legal ? "/" : "#inizio"} aria-label={t("nav.logo_aria")}>
          <Logo phase="notte" size={34} sizeSm={30} />
        </a>
        {!legal && (
          <span className="pill-hour-wrap">
            <HourRoll />
          </span>
        )}
        <div className="pill-end">
          {legal ? (
            <a className="lang-switch lang-switch-single" href="/en/" lang="en" hrefLang="en" aria-label={t("language.switch_to_en")}>
              EN
            </a>
          ) : (
            <LangSwitch place="header" />
          )}
          <a className="pill-call" href={PHONE_HREF} aria-label={t("nav.chiama_aria")}>
            <PhoneIcon />
            {t("nav.chiama")}
          </a>
        </div>
      </div>
    </header>
  )
}
