import { useTranslation } from "@/i18n/react"
import { Button } from "../Button"
import { HourLabel } from "../HourLabel"
import { Picture } from "../Picture"
import { Sheet } from "../Sheet"
import { WhatsAppIcon } from "../icons"
import { ContactForm } from "../forms/ContactForm"
import { DWindowLine } from "../shell/DWindow"
import { EMAIL, EMAIL_HREF, PHONE_DISPLAY, PHONE_HREF, whatsappHref } from "@/content/contacts"
import { SECTIONS, sectionAttrs } from "@/content/hours"
import "./Common.css"
import "./Night.css"

/** 22:00, contatti: il giro si chiude dentro la D. Numero di telefono e riga del 112 non si animano mai. */
export function Contatti() {
  const { t } = useTranslation()
  return (
    <section {...sectionAttrs("contatti")} className="section">
      <div className="wrap grid12 items-start">
        <div className="col-span-full lg:col-[1/5]">
          <div className="d-window-box" data-reveal="fade">
            <div className="d-window">
              <Picture
                name="notte-finestra-orizz"
                mobileName="notte-finestra-vert"
                sizes="(min-width:1024px) 660px, 240px"
                flat
                objectPosition="17% 50%"
              />
            </div>
            <DWindowLine />
          </div>
        </div>
        <div className="col-span-full lg:col-[6/13]">
          <HourLabel time={SECTIONS.contatti.label} size="s" />
          <p className="t-eyebrow">{t("contatti.eyebrow")}</p>
          <h2 className="t-h2">{t("contatti.title")}</h2>
          <p className="t-lead sec-intro">{t("contatti.subline")}</p>
          <a className="contatti-phone t-phone" href={PHONE_HREF} aria-label={t("nav.chiama_aria")}>
            {PHONE_DISPLAY}
          </a>
          <div className="mt-6">
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
          <p className="contatti-email">
            {t("contatti.email_label")}{" "}
            <a className="link-text" href={EMAIL_HREF}>
              {EMAIL}
            </a>
          </p>
          <p className="emergency mt-8">{t("contatti.emergenza")}</p>
          <Sheet className="mt-10">
            <ContactForm />
          </Sheet>
        </div>
      </div>
    </section>
  )
}
