import { useTranslation } from "@/i18n/react"
import { Button } from "../Button"
import { Sheet } from "../Sheet"
import { PlusIcon, WhatsAppIcon } from "../icons"
import { ContactForm } from "../forms/ContactForm"
import { CurriculumForm } from "../forms/CurriculumForm"
import { EMAIL, EMAIL_HREF, PHONE_DISPLAY, PHONE_HREF, whatsappHref } from "@/content/contacts"
import "./Sections.css"

interface Item {
  title: string
  body: string
}

/** 1. Come funziona: quattro passi su una riga, numeri larghi e una linea che si disegna con lo scroll. */
export function ComeFunziona() {
  const { t } = useTranslation()
  const steps = t("processo.items", { returnObjects: true }) as Item[]
  return (
    <section id="come-funziona" className="sec" data-tone="light">
      <div className="wrap">
        <h2 className="sec-title" data-reveal>
          {t("processo.heading")}
        </h2>
        <p className="sec-lead" data-reveal>
          {t("processo.title")}
        </p>
        <ol className="steps">
          {steps.map((s, i) => (
            <li key={s.title} data-reveal style={{ "--i": i } as React.CSSProperties}>
              <span className="step-n">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="step-t">{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/** 2. Per chi: righe grandi, come un indice; ciascuna si apre al tocco con la sua frase. */
export function PerChi() {
  const { t } = useTranslation()
  const items = t("assistiti.items", { returnObjects: true }) as Item[]
  return (
    <section id="per-chi" className="sec" data-tone="light">
      <div className="wrap">
        <h2 className="sec-title" data-reveal>
          {t("perchi.title")}
        </h2>
        <p className="sec-lead" data-reveal>
          {t("perchi.intro")}
        </p>
        <div className="index">
          {items.map((it, i) => (
            <details key={it.title} name="per-chi" className="index-row" data-reveal>
              <summary>
                <span className="index-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="index-t">{it.title}</span>
                <PlusIcon />
              </summary>
              <div className="index-body">
                <p>{it.body}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/** 3. Dove: i comuni in un nastro che scorre piano (fermo con movimento ridotto), la nota sulla disponibilità, nessuna mappa. */
export function Dove() {
  const { t } = useTranslation()
  const comuni = t("aree.comuni", { returnObjects: true }) as string[]
  return (
    <section id="aree" className="sec sec-dove" data-tone="light">
      <div className="wrap">
        <h2 className="sec-title" data-reveal>
          {t("aree.title")}
        </h2>
      </div>
      <div className="marquee">
        <div className="marquee-track">
          <ul className="marquee-list">
            {comuni.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <ul className="marquee-list marquee-dup" aria-hidden="true">
            {comuni.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="wrap">
        <p className="sec-note" data-reveal>
          {t("aree.intro")}
        </p>
      </div>
    </section>
  )
}

/** 4. Tariffe: una frase, i quattro fattori come righe, il bottone porta al modulo. */
export function Tariffe() {
  const { t } = useTranslation()
  const factors = t("tariffario.factors", { returnObjects: true }) as Item[]
  // Il bottone porta direttamente al modulo; il modulo ascolta `dedicare:prefill` e riempie il messaggio solo se è vuoto.
  const onCta = () => {
    window.dispatchEvent(new CustomEvent("dedicare:prefill", { detail: { message: t("tariffario.prefill") } }))
    window.setTimeout(() => {
      document.querySelector<HTMLInputElement>('#contatti input[autocomplete="name"]')?.focus({ preventScroll: true })
    }, 700)
  }
  return (
    <section id="tariffe" className="sec" data-tone="light">
      <div className="wrap split">
        <div className="split-head">
          <h2 className="sec-title" data-reveal>
            {t("tariffario.heading")}
          </h2>
          <p className="sec-lead" data-reveal>
            {t("tariffario.frase")}
          </p>
          <div data-reveal>
            <Button href="#modulo-contatti" onClick={onCta}>
              {t("tariffario.cta")}
            </Button>
          </div>
        </div>
        <ul className="rows">
          {factors.map((f) => (
            <li key={f.title} data-reveal>
              <h3 className="row-t">{f.title}</h3>
              <p>{f.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** 5. Domande frequenti: fisarmonica nativa con apertura morbida. */
export function Faq() {
  const { t } = useTranslation()
  const items = t("faq.items", { returnObjects: true }) as { q: string; a: string }[]
  return (
    <section id="faq" className="sec" data-tone="light">
      <div className="wrap split">
        <div className="split-head">
          <h2 className="sec-title" data-reveal>
            {t("faq.title")}
          </h2>
          <p className="sec-lead" data-reveal>
            {t("faq.intro")}
          </p>
          <p data-reveal>
            <a className="link-text" href="#contatti">
              {t("faq.cta")}
            </a>
          </p>
        </div>
        <div className="faq-list">
          {items.map((it) => (
            <details key={it.q} className="faq-item" data-reveal>
              <summary>
                <span className="faq-q">{it.q}</span>
                <PlusIcon />
              </summary>
              <div className="faq-a">
                <p>{it.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/** 6. Lavora con noi: banda indaco, tre motivi in una riga, il modulo di candidatura nel foglio. */
export function LavoraConNoi() {
  const { t } = useTranslation()
  const reasons = t("curriculum.reasons", { returnObjects: true }) as Item[]
  return (
    <section id="lavora-con-noi" className="sec sec-band" data-tone="dark">
      <div className="wrap">
        <h2 className="sec-title" data-reveal>
          {t("curriculum.title")}
        </h2>
        <p className="sec-lead" data-reveal>
          {t("curriculum.intro")}
        </p>
        <ul className="reasons">
          {reasons.map((r, i) => (
            <li key={r.title} data-reveal style={{ "--i": i } as React.CSSProperties}>
              <span className="step-n">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="row-t">{r.title}</h3>
              <p>{r.body}</p>
            </li>
          ))}
        </ul>
        <Sheet className="band-form" data-reveal>
          <h3 className="sheet-title">{t("curriculum.form_title")}</h3>
          <CurriculumForm />
        </Sheet>
      </div>
    </section>
  )
}

/** 7. Contatti: telefono grande, WhatsApp, email, indirizzo e il modulo. */
export function Contatti() {
  const { t } = useTranslation()
  return (
    <section id="contatti" className="sec" data-tone="light">
      <div className="wrap split split-contact">
        <div className="split-head">
          <h2 className="sec-title" data-reveal>
            {t("contatti.heading")}
          </h2>
          <a className="phone-big" href={PHONE_HREF} aria-label={t("nav.chiama_aria")} data-reveal>
            {PHONE_DISPLAY}
          </a>
          <div data-reveal>
            <Button variant="secondary" href={whatsappHref(t("whatsapp.prefill"))} target="_blank" rel="noopener noreferrer" icon={<WhatsAppIcon />}>
              {t("film.whatsapp")}
            </Button>
          </div>
          <dl className="contact-list" data-reveal>
            <div>
              <dt>{t("contatti.email_label")}</dt>
              <dd>
                <a className="link-text" href={EMAIL_HREF}>
                  {EMAIL}
                </a>
              </dd>
            </div>
            <div>
              <dt>{t("contatti.sede")}</dt>
              <dd>{t("contatti.sede_valore")}</dd>
            </div>
          </dl>
          <p className="emergency" data-reveal>
            {t("contatti.emergenza")}
          </p>
        </div>
        <Sheet className="contact-form" data-reveal>
          <ContactForm />
        </Sheet>
      </div>
    </section>
  )
}
