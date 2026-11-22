import { useTranslation } from "@/i18n/react"
import { Button } from "../Button"
import { Picture } from "../Picture"
import { WhatsAppIcon } from "../icons"
import { PHONE_HREF, whatsappHref } from "@/content/contacts"
import { sectionAttrs } from "@/content/hours"
import "./Hero.css"

const SERVICE_LINKS = [
  { href: "#operatori-oss", key: "oss" },
  { href: "#assistenza-24-7", key: "assistenza247" },
  { href: "#accompagnamento", key: "accompagnamento" },
  { href: "#multidisciplinare", key: "multidisciplinare" },
] as const

/** Hero (22:00): H1, sottotitolo e foto non hanno nessun ingresso, nessun opacity 0, nessun transform (sono l'LCP). */
export function Hero() {
  const { t } = useTranslation()
  return (
    <section {...sectionAttrs("inizio")} className="hero">
      <div className="hero-bg">
        <Picture
          name="notte-finestra-orizz"
          mobileName="notte-finestra-vert"
          sizes="100vw"
          priority
          flat
          className="hero-photo"
          objectPosition="0% 30%"
        />
        <div className="hero-veil-bottom" aria-hidden="true" />
        <div className="hero-veil-right" aria-hidden="true" />
      </div>
      <div className="hero-text">
        <p className="hero-hour" aria-hidden="true">
          22:00
        </p>
        <p className="t-eyebrow hero-eyebrow">{t("hero.eyebrow")}</p>
        <h1 className="t-h1 hero-h1">
          {t("hero.h1_a")}{" "}
          <span className="max-lg:hidden">
            <br />
          </span>
          {t("hero.h1_b")}
        </h1>
        <p className="t-lead hero-sub">{t("hero.sub")}</p>
        <div className="hero-actions">
          <Button href={PHONE_HREF} gold>
            <span className="max-lg:hidden">{t("hero.cta_call")}</span>
            <span className="lg:hidden">{t("hero.cta_call_short")}</span>
          </Button>
          <Button
            variant="secondary"
            href={whatsappHref(t("whatsapp.prefill"))}
            target="_blank"
            rel="noopener noreferrer"
            icon={<WhatsAppIcon />}
          >
            {t("hero.cta_whatsapp")}
          </Button>
        </div>
        <nav className="hero-services" aria-label={t("nav.servizi")}>
          {SERVICE_LINKS.map((s) => (
            <span key={s.href} className="hero-service">
              <a className="link-text" href={s.href}>
                {t(`servizi.items.${s.key}.title`)}
              </a>
            </span>
          ))}
        </nav>
      </div>
    </section>
  )
}
