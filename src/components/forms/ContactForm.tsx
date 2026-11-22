import { useEffect, useRef, useState, type FormEvent } from "react"
import { Trans, useTranslation } from "@/i18n/react"
import { Button } from "../Button"
import { Field } from "./Field"
import { useForm } from "./useForm"
import { inviaContatto, LIMITI, PRIVACY_POLICY_URL, getFormsMode, type ContattoErrorKey } from "@/lib/formsApi"
import { CONTATTO_RULES } from "@/lib/validation"
import type { Lang } from "@/routes"

type Status = { phase: "idle" } | { phase: "sending" } | { phase: "success" } | { phase: "error"; key: ContattoErrorKey | "error_network" }

const INITIAL = { nome: "", telefono: "", email: "", messaggio: "" }

/** Evento con cui il bottone delle tariffe precompila il messaggio (se vuoto) e porta il fuoco sul Nome. */
export const PREFILL_EVENT = "dedicare:prefill"

export function ContactForm() {
  const { t, i18n } = useTranslation()
  const lang: Lang = i18n.language === "en" ? "en" : "it"
  const form = useForm(CONTATTO_RULES, INITIAL)
  const { values, errors, setValue, fillIfEmpty, blur, validateAll, reset, honeypot, setHoneypot } = form
  const [status, setStatus] = useState<Status>({ phase: "idle" })
  const [invalid, setInvalid] = useState(false)
  const sending = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const mode = getFormsMode()

  useEffect(() => {
    const onPrefill = (e: Event) => {
      const detail = (e as CustomEvent<string | { message?: string } | undefined>).detail
      const text = typeof detail === "string" ? detail : detail?.message
      if (text) fillIfEmpty("messaggio", text)
      formRef.current?.querySelector<HTMLElement>('[name="nome"]')?.focus({ preventScroll: true })
    }
    window.addEventListener(PREFILL_EVENT, onPrefill)
    return () => window.removeEventListener(PREFILL_EVENT, onPrefill)
  }, [fillIfEmpty])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (sending.current) return
    const first = validateAll()
    if (first) {
      setInvalid(true)
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setInvalid(false)
    sending.current = true
    setStatus({ phase: "sending" })
    const res = await inviaContatto({ ...values, honeypot }, lang)
    sending.current = false
    if (res.ok) {
      reset()
      setStatus({ phase: "success" })
    } else {
      setStatus({ phase: "error", key: res.key })
    }
  }

  if (status.phase === "success") {
    return (
      <div role="status" className="form-success">
        <h3>{t("contactform.success_title")}</h3>
        <p>{t("contactform.success_body")}</p>
        <button type="button" className="form-retry" onClick={() => setStatus({ phase: "idle" })}>
          {t("contactform.success_retry")}
        </button>
      </div>
    )
  }

  const sendingNow = status.phase === "sending"
  const alertText = invalid ? t("contactform.error_required") : status.phase === "error" ? t(`contactform.${status.key}`) : null

  return (
    <form ref={formRef} className="form" onSubmit={onSubmit} noValidate>
      <h3 className="form-title">{t("contactform.intro")}</h3>
      <p className="form-legend">{t("form.legenda")}</p>
      <Field name="nome" label={t("contactform.nome")} required max={LIMITI.nome} value={values.nome} error={errors.nome} placeholder={t("contactform.placeholder_nome")} autoComplete="name" onChange={(v) => setValue("nome", v)} onBlur={() => blur("nome")} />
      <div className="form-row">
        <Field name="telefono" type="tel" label={t("contactform.telefono")} max={LIMITI.telefono} value={values.telefono} error={errors.telefono} placeholder={t("contactform.placeholder_telefono")} autoComplete="tel" onChange={(v) => setValue("telefono", v)} onBlur={() => blur("telefono")} />
        <Field name="email" type="email" label={t("contactform.email")} required max={LIMITI.email} value={values.email} error={errors.email} placeholder={t("contactform.placeholder_email")} autoComplete="email" onChange={(v) => setValue("email", v)} onBlur={() => blur("email")} />
      </div>
      <Field as="textarea" name="messaggio" label={t("contactform.messaggio")} required max={LIMITI.messaggio} value={values.messaggio} error={errors.messaggio} placeholder={t("contactform.placeholder_messaggio")} hint={t("contactform.hint_salute")} onChange={(v) => setValue("messaggio", v)} onBlur={() => blur("messaggio")} />
      <p className="form-consent">
        <Trans i18nKey="contactform.informativa" components={{ privacyLink: <a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer" hrefLang="it" /> }} />
      </p>
      <div className="hp" aria-hidden="true">
        <input type="text" name={mode.honeypot} tabIndex={-1} autoComplete="off" data-1p-ignore data-lpignore="true" data-bwignore="true" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>
      {alertText && (
        <p role="alert" className="form-alert">
          {alertText}
        </p>
      )}
      <Button type="submit" className="form-submit" disabled={sendingNow}>
        {sendingNow ? t("contactform.submitting") : t("contactform.submit")}
      </Button>
    </form>
  )
}
