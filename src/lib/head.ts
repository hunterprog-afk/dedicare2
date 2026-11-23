import type { TFunction } from "@/i18n/react"
import { SITE_URL } from "@/content/contacts"
import { getRoute, isHome, type RouteId } from "@/routes"

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** JSON dentro `<script>`: niente `<` letterale, così `</script>` non può chiudere il blocco. */
const jsonScript = (data: unknown) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`

const LEGAL_TITLES: Record<string, string> = {
  privacy: "Privacy Policy — LyzCare",
  cookie: "Cookie Policy — LyzCare",
  "note-legali": "Note Legali — LyzCare",
}

const LEGAL_DESC_KEYS: Record<string, string> = {
  privacy: "legal.description_privacy",
  cookie: "legal.description_cookie",
  "note-legali": "legal.description_note",
}

const LOCAL_BUSINESS = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://dedicaresolutions.it/#organization",
  name: "LyzCare",
  legalName: "Dedicare Solutions S.r.l.s.",
  brand: { "@type": "Brand", name: "LyzCare" },
  description: "Assistenza domiciliare a Milano e hinterland: operatori OSS, turni anche 24 ore su 24 e notti, accompagnamento a visite e terapie.",
  url: "https://dedicaresolutions.it/",
  telephone: "+39 388 253 6992",
  email: "info@dedicaresolutions.it",
  image: "https://dedicaresolutions.it/og-image.png",
  logo: "https://dedicaresolutions.it/favicon-512.png",
  priceRange: "€€",
  vatID: "IT11600760968",
  taxID: "11600760968",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Via Roma 80",
    addressLocality: "Segrate",
    postalCode: "20054",
    addressRegion: "MI",
    addressCountry: "IT",
  },
  areaServed: [
    { "@type": "City", name: "Milano" },
    { "@type": "AdministrativeArea", name: "Città metropolitana di Milano" },
  ],
  founder: { "@type": "Person", name: "Lisis Zuniga", jobTitle: "Fondatrice e coordinatrice del servizio" },
  sameAs: ["https://wa.me/393882536992"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servizi di assistenza domiciliare",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Operatori Socio Sanitari (OSS) a domicilio" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Assistenza 24 ore su 24 e notti" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Accompagnamento a visite, esami e terapie" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Infermieri e OSS a domicilio" } },
    ],
  },
}

interface HeadOptions {
  route: RouteId
  t: TFunction
  /** URL dei due font da precaricare (con l'hash di Vite). */
  fontUrls: string[]
}

/** Righe del `<head>` nell'ordine della specifica, come stringa. */
export function buildHead({ route, t, fontUrls }: HeadOptions): string {
  const def = getRoute(route)
  const home = isHome(route)
  const canonical = `${SITE_URL}${def.path}`
  const title = home ? t("meta.title") : LEGAL_TITLES[route]
  const description = home ? t("meta.description") : t(LEGAL_DESC_KEYS[route])
  const lines: string[] = []

  lines.push(`<title>${esc(title)}</title>`)
  lines.push(`<meta name="description" content="${esc(description)}">`)
  lines.push(`<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`)
  lines.push(`<meta name="googlebot" content="index, follow">`)
  if (route === "home-it") lines.push(`<meta name="msvalidate.01" content="B4EC8F3E0EE271789B137E67372E9F43">`)
  lines.push(`<meta name="theme-color" content="#231C4D">`)
  lines.push(`<link rel="canonical" href="${canonical}">`)
  if (home) {
    lines.push(`<link rel="alternate" hreflang="it" href="${SITE_URL}/">`)
    lines.push(`<link rel="alternate" hreflang="en" href="${SITE_URL}/en/">`)
    lines.push(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}/">`)
  }
  lines.push(`<link rel="icon" href="/favicon.svg" type="image/svg+xml">`)
  lines.push(`<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">`)
  lines.push(`<link rel="apple-touch-icon" href="/favicon-180.png">`)
  lines.push(`<link rel="manifest" href="/site.webmanifest">`)

  if (home) {
    const otherLocale = def.lang === "it" ? "en_GB" : "it_IT"
    lines.push(`<meta property="og:title" content="${esc(title)}">`)
    lines.push(`<meta property="og:description" content="${esc(description)}">`)
    lines.push(`<meta property="og:type" content="website">`)
    lines.push(`<meta property="og:url" content="${canonical}">`)
    lines.push(`<meta property="og:image" content="${SITE_URL}/og-image.png">`)
    lines.push(`<meta property="og:image:width" content="1200">`)
    lines.push(`<meta property="og:image:height" content="630">`)
    lines.push(`<meta property="og:locale" content="${esc(t("meta.og_locale"))}">`)
    lines.push(`<meta property="og:locale:alternate" content="${otherLocale}">`)
    lines.push(`<meta property="og:site_name" content="LyzCare">`)
    lines.push(`<meta name="twitter:card" content="summary_large_image">`)
    lines.push(`<meta name="twitter:title" content="${esc(title)}">`)
    lines.push(`<meta name="twitter:description" content="${esc(description)}">`)
    lines.push(`<meta name="twitter:image" content="${SITE_URL}/og-image.png">`)
  }

  for (const url of fontUrls) {
    lines.push(`<link rel="preload" as="font" type="font/woff2" href="${esc(url)}" crossorigin>`)
  }
  if (home) {
    // Il primo fotogramma del film è l'elemento principale della pagina: parte subito.
    lines.push(`<link rel="preload" as="image" href="/film/s1.jpg" media="(min-width: 860px)" fetchpriority="high">`)
    lines.push(`<link rel="preload" as="image" href="/film/s1-m.jpg" media="(max-width: 859px)" fetchpriority="high">`)

    const faq = t("faq.items", { returnObjects: true }) as { q: string; a: string }[]
    lines.push(jsonScript(LOCAL_BUSINESS))
    lines.push(
      jsonScript({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        inLanguage: def.lang,
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }),
    )
  }
  return lines.join("\n    ")
}

export { esc as escapeHtml }
