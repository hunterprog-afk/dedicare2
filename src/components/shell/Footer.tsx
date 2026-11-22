import { useTranslation } from "@/i18n/react"
import { Logo } from "../brand/Logo"
import { LangSwitch } from "./LangSwitch"
import { EMAIL, EMAIL_HREF, PHONE_DISPLAY, PHONE_HREF, whatsappHref } from "@/content/contacts"

const LEGAL_LINKS = [
  { href: "/privacy/", key: "footer.privacy" },
  { href: "/cookie/", key: "footer.cookie" },
  { href: "/note-legali/", key: "footer.legal" },
] as const

export function Footer() {
  const { t, i18n } = useTranslation()
  const inEnglish = i18n.language === "en"
  return (
    <footer role="contentinfo" className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Logo phase="notte" size={48} />
          <p className="footer-slogan t-h3">{t("footer.slogan")}</p>
        </div>
        <div className="footer-contacts">
          <a href={PHONE_HREF}>{PHONE_DISPLAY}</a>
          <a href={whatsappHref(t("whatsapp.prefill"))} target="_blank" rel="noopener noreferrer">
            {t("mobilebar.whatsapp")}
          </a>
          <a href={EMAIL_HREF}>{EMAIL}</a>
        </div>
        <div className="footer-legal">
          <nav aria-label={t("footer.legal_nav")}>
            <ul>
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} hrefLang={inEnglish ? "it" : undefined}>
                    {t(l.key)}
                    {inEnglish ? t("footer.in_italian") : ""}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <LangSwitch place="footer" />
        </div>
        <p className="footer-copyright">{t("footer.copyright", { year: __BUILD_YEAR__ })}</p>
      </div>
    </footer>
  )
}
