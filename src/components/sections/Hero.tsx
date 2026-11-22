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
      <Picture
        name="notte-finestra-orizz"
        mobileName="notte-finestra-vert"
        sizes="100vw"
        priority
        flat
        className="hero-photo"
        objectPosition="50% 50%"
      />
      <div className="hero-veil-bottom" aria-hidden="true" />
      <div className="hero-veil-right" aria-hidden="true" />
      <div className="hero-text">
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
          <Button href={PHONE_HREF} gold aria-label={t("nav.chiama_aria")}>
            {t("hero.cta_call")}
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
      </div>
      <nav className="hero-services" aria-label={t("nav.servizi")}>
        {SERVICE_LINKS.map((s, i) => (
          <span key={s.href} className="hero-service">
            {i > 0 && (
              <span className="hero-sep" aria-hidden="true">
                {" · "}
              </span>
            )}
            <a className="link-text" href={s.href}>
              {t(`servizi.items.${s.key}.title`)}
            </a>
          </span>
        ))}
      </nav>
    </section>
  )
}
