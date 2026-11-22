import { useTranslation } from "react-i18next"
import { Header } from "../shell/Header"
import { Footer } from "../shell/Footer"

export type LegalKind = "privacy" | "cookie" | "note-legali"

const TITLES: Record<LegalKind, string> = {
  privacy: "Privacy Policy",
  cookie: "Cookie Policy",
  "note-legali": "Note Legali",
}

/** SEGNAPOSTO: pagina legale. Header e footer sono quelli veri; il corpo (da `src/content/legal.ts`) lo costruisce chi fa le legali. */
export function LegalPage({ kind }: { kind: LegalKind }) {
  const { t } = useTranslation()
  return (
    <>
      <a className="skip" href="#contenuto">
        {t("a11y.skip")}
      </a>
      <Header variant="legal" />
      <main id="contenuto" className="wrap-legal" data-placeholder="legal">
        <h1 className="t-h2">{TITLES[kind]}</h1>
      </main>
      <Footer />
    </>
  )
}
