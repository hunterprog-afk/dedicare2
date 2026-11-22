import { useTranslation } from "react-i18next"
import { HourLabel } from "../HourLabel"
import { SECTIONS, sectionAttrs } from "@/content/hours"
import "./Day.css"

interface Item {
  title: string
  body: string
}

/** Ogni parola del titolo è un elemento a sé: il motore le accende una dopo l'altra. */
function Words({ text, from }: { text: string; from: number }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={`${w}-${i}`} data-word style={{ "--reveal-delay": `${(from + i) * 60}ms` } as React.CSSProperties}>
          {w}{" "}
        </span>
      ))}
    </>
  )
}

/** 12:00, perché sceglierci: pausa tipografica, nessuna foto. */
export function Perche() {
  const { t } = useTranslation()
  const a = t("perche.title_a")
  const b = t("perche.title_b")
  const items = t("perche.items", { returnObjects: true }) as Item[]
  return (
    <section {...sectionAttrs("perche")} className="section">
      <span id="filosofia" aria-hidden="true" />
      <div className="wrap grid12">
        <div className="col-span-full lg:col-[1/10]">
          <HourLabel time={SECTIONS.perche.label} size="s" />
          <p className="t-eyebrow">{t("perche.eyebrow")}</p>
          <h2 className="t-display">
            <Words text={a} from={0} />
            <br />
            <Words text={b} from={a.split(" ").length} />
          </h2>
        </div>
        <p className="t-lead sec-intro col-span-full lg:col-[1/8]">{t("perche.intro")}</p>
        <div className="perche-grid sec-head-gap col-span-full lg:col-[1/11]">
          {items.map((it) => (
            <div key={it.title} className="perche-item">
              <h3 className="t-h3">{it.title}</h3>
              <p>{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
