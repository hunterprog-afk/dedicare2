import { Fragment, type ReactNode } from "react"
import { useTranslation } from "@/i18n/react"
import { Header } from "../shell/Header"
import { Footer } from "../shell/Footer"
import { cookiePolicy, noteLegali, privacyPolicy } from "@/content/legal"

export type LegalKind = "privacy" | "cookie" | "note-legali"

interface LegalDoc {
  title: string
  sections: readonly { heading: string; content: string }[]
}

const DOCS: Record<LegalKind, LegalDoc> = {
  privacy: privacyPolicy,
  cookie: cookiePolicy,
  "note-legali": noteLegali,
}

const BULLET = "• "

/**
 * Trasforma `content` in blocchi: si divide su riga vuota; le righe che iniziano con «• » diventano
 * elenchi, ogni altro blocco un paragrafo in cui gli a capo singoli sono `<br/>`.
 */
function renderContent(content: string): ReactNode[] {
  const out: ReactNode[] = []
  content.split("\n\n").forEach((block, bi) => {
    const lines = block.split("\n")
    if (!block.startsWith(BULLET)) {
      out.push(<Paragraph key={bi} lines={lines} />)
      return
    }
    let i = 0
    while (i < lines.length) {
      const start = i
      const bullet = lines[i].startsWith(BULLET)
      while (i < lines.length && lines[i].startsWith(BULLET) === bullet) i++
      const group = lines.slice(start, i)
      out.push(
        bullet ? (
          <ul key={`${bi}-${start}`}>
            {group.map((l, li) => (
              <li key={li}>{l.slice(BULLET.length)}</li>
            ))}
          </ul>
        ) : (
          <Paragraph key={`${bi}-${start}`} lines={group} />
        ),
      )
    }
  })
  return out
}

function Paragraph({ lines }: { lines: string[] }) {
  return (
    <p>
      {lines.map((l, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {l}
        </Fragment>
      ))}
    </p>
  )
}

/** Pagina legale pre-renderizzata: testi solo da `src/content/legal.ts`, nessun movimento. */
export function LegalPage({ kind }: { kind: LegalKind }) {
  const { t } = useTranslation()
  const doc = DOCS[kind]
  return (
    <>
      <a className="skip" href="#contenuto">
        {t("a11y.skip")}
      </a>
      <Header variant="legal" />
      <div className="legal-bg">
        <main id="contenuto" className="wrap-legal">
          <a className="legal-back" href="/">
            {t("legal.back")}
          </a>
          <h1 className="t-h2">{doc.title}</h1>
          {doc.sections.map((s) => (
            <section key={s.heading} className="legal-section">
              <h2 className="t-h3">{s.heading}</h2>
              <div className="legal-body t-body">{renderContent(s.content)}</div>
            </section>
          ))}
        </main>
      </div>
      <Footer />
    </>
  )
}
