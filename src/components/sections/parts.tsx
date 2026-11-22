import { useTranslation } from "react-i18next"
import { PlusIcon } from "../icons"
import "./Common.css"

/** Punti di un servizio: lineetta al posto del pallino. */
export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="svc-bullets">
      {items.map((b) => (
        <li key={b}>{b}</li>
      ))}
    </ul>
  )
}

/** Dettagli di un servizio: `<details>` nativo, si apre senza JavaScript e con la ricerca del browser. */
export function ServiceDetails({ text }: { text: string }) {
  const { t } = useTranslation()
  return (
    <details className="svc-details">
      <summary>
        <span>{t("servizi.scopri")}</span>
        <PlusIcon />
      </summary>
      <p className="svc-long">{text}</p>
    </details>
  )
}

/** Titolo su due righe con un a capo fisso fra le due parti. */
export function TwoLines({ a, b }: { a: string; b: string }) {
  return (
    <>
      {a} <br />
      {b}
    </>
  )
}
