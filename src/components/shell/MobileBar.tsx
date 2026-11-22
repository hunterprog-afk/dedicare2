import { useTranslation } from "@/i18n/react"
import { PhoneIcon, WhatsAppIcon } from "../icons"
import { PHONE_HREF, whatsappHref } from "@/content/contacts"

/** Barra flottante in vetro del telefono: Chiama e WhatsApp, sempre in vista dentro l'area sicura. */
export function MobileBar() {
  const { t } = useTranslation()
  return (
    <div className="mobile-bar" role="region" aria-label={t("mobilebar.label")}>
      <a className="bar-call" href={PHONE_HREF}>
        <PhoneIcon />
        {t("mobilebar.call")}
      </a>
      <a className="bar-wa" href={whatsappHref(t("whatsapp.prefill"))} target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon />
        {t("mobilebar.whatsapp")}
      </a>
    </div>
  )
}
