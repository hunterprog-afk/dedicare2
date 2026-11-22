// Recapiti pubblici: una sola fonte per link e testo.
export const PHONE_DISPLAY = "+39 388 253 6992"
export const PHONE_HREF = "tel:+393882536992"
export const EMAIL = "info@dedicaresolutions.it"
export const EMAIL_HREF = "mailto:info@dedicaresolutions.it"
export const SITE_URL = "https://dedicaresolutions.it"

export function whatsappHref(prefill: string): string {
  return `https://wa.me/393882536992?text=${encodeURIComponent(prefill)}`
}
