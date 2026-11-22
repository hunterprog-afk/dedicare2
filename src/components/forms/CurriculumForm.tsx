import { useId, useRef, useState, type ChangeEvent, type FormEvent } from "react"
import { Trans, useTranslation } from "@/i18n/react"
import { Button } from "../Button"
import { Field } from "./Field"
import { useForm } from "./useForm"
import { useHydrated } from "./useHydrated"
import { inviaCandidatura, LIMITI, INFORMATIVA_CANDIDATI_URL, POSIZIONI_INVIATE, getFormsMode, type CandidaturaErrorKey } from "@/lib/formsApi"
import { CANDIDATURA_RULES, checkCv, hasPdfMagic } from "@/lib/validation"
import type { Lang } from "@/routes"

type Status = { phase: "idle" } | { phase: "sending" } | { phase: "success" } | { phase: "error"; key: CandidaturaErrorKey | "error_network" }

const INITIAL = { nome: "", cognome: "", email: "", telefono: "", posizione: "", messaggio: "" }
const POSIZIONI = ["oss", "infermiere", "fisioterapista", "assistente", "altro"] as const

export function CurriculumForm() {
  const { t, i18n } = useTranslation()
  const lang: Lang = i18n.language === "en" ? "en" : "it"
  const form = useForm(CANDIDATURA_RULES, INITIAL)
  const { values, errors, setValue, blur, validateAll, reset, honeypot, setHoneypot } = form
  const [status, setStatus] = useState<Status>({ phase: "idle" })
  const [invalid, setInvalid] = useState(false)
  const [cv, setCv] = useState<File | null>(null)
  const [cvError, setCvError] = useState<"error_filesize" | "error_filetype" | null>(null)
  const sending = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const uid = useId()
  const cvLabelId = `${uid}-cv-label`
  const cvHintId = `${uid}-cv-hint`
  const cvErrId = `${uid}-cv-err`
  const mode = getFormsMode()
  const hydrated = useHydrated()

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target
    const file = input.files?.[0] ?? null
    if (!file) {
      setCv(null)
      return
    }
    let check = checkCv(file)
    if (check === "ok" && !(await hasPdfMagic(file))) check = "error_filetype"
    if (check === "ok") {
      setCv(file)
      setCvError(null)
    } else {
      input.value = ""
      setCv(null)
      setCvError(check)
    }
  }

  function resetAll() {
    reset()
    setCv(null)
    setCvError(null)
    if (fileRef.current) fileRef.current.value = ""
  }

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
    const res = await inviaCandidatura({ ...values, cv, honeypot }, lang)
    sending.current = false
    if (res.ok) {
      resetAll()
      setStatus({ phase: "success" })
    } else {
      if (res.key === "error_filesize" || res.key === "error_filetype") setCvError(res.key)
      setStatus({ phase: "error", key: res.key })
    }
  }

  if (status.phase === "success") {
    return (
      <div role="status" className="form-success">
        <h3>{t("curriculum.success_title")}</h3>
        <p>{t("curriculum.success_body")}</p>
        <button type="button" className="form-retry" onClick={() => setStatus({ phase: "idle" })}>
          {t("curriculum.success_retry")}
        </button>
      </div>
    )
  }

  const sendingNow = status.phase === "sending"
  const alertText = invalid ? t("curriculum.error_required") : status.phase === "error" ? t(`curriculum.${status.key}`) : null

  return (
    <form ref={formRef} className="form" method="post" onSubmit={onSubmit} noValidate>
      <h3 className="form-title">{t("curriculum.form_title")}</h3>
      <p className="form-legend">{t("form.legenda")}</p>
      <div className="form-row">
        <Field name="nome" label={t("curriculum.nome")} required max={LIMITI.nome} value={values.nome} error={errors.nome} autoComplete="given-name" onChange={(v) => setValue("nome", v)} onBlur={() => blur("nome")} />
        <Field name="cognome" label={t("curriculum.cognome")} required max={LIMITI.cognome} value={values.cognome} error={errors.cognome} autoComplete="family-name" onChange={(v) => setValue("cognome", v)} onBlur={() => blur("cognome")} />
      </div>
      <div className="form-row">
        <Field name="email" type="email" label={t("curriculum.email")} required max={LIMITI.email} value={values.email} error={errors.email} autoComplete="email" onChange={(v) => setValue("email", v)} onBlur={() => blur("email")} />
        <Field name="telefono" type="tel" label={t("curriculum.telefono")} max={LIMITI.telefono} value={values.telefono} error={errors.telefono} autoComplete="tel" onChange={(v) => setValue("telefono", v)} onBlur={() => blur("telefono")} />
      </div>
      <Field as="select" name="posizione" label={t("curriculum.posizione")} required max={LIMITI.posizione} value={values.posizione} error={errors.posizione} onChange={(v) => setValue("posizione", v)} onBlur={() => blur("posizione")}>
        <option value="" disabled>
          {t("curriculum.posizione_placeholder")}
        </option>
        {POSIZIONI.map((p) => (
          // Il valore inviato è sempre l'etichetta italiana, anche dalla pagina inglese.
          <option key={p} value={POSIZIONI_INVIATE[p]}>
            {t(`curriculum.posizioni.${p}`)}
          </option>
        ))}
      </Field>
      <Field as="textarea" name="messaggio" label={t("curriculum.messaggio")} max={LIMITI.messaggio} value={values.messaggio} error={errors.messaggio} placeholder={t("curriculum.placeholder_messaggio")} onChange={(v) => setValue("messaggio", v)} onBlur={() => blur("messaggio")} />
      <div role="group" aria-labelledby={cvLabelId} className="cv-group">
        <span id={cvLabelId} className="field-label">
          {t("curriculum.cv")}
        </span>
        <div className="cv-pick">
          <input ref={fileRef} type="file" id="cv" name="cv" accept="application/pdf,.pdf" className="sr-only" aria-describedby={[cvError ? cvErrId : null, cvHintId].filter(Boolean).join(" ")} onChange={onFile} />
          <label htmlFor="cv" className="btn btn-secondary">
            <span>{t("curriculum.cv_select")}</span>
          </label>
          <span className="cv-name">{cv ? cv.name : t("curriculum.cv_none")}</span>
        </div>
        {cvError && (
          <p id={cvErrId} role="alert" className="field-error">
            {t(`curriculum.${cvError}`)}
          </p>
        )}
        <p id={cvHintId} className="field-hint">
          {t("curriculum.hint_cv")}
        </p>
      </div>
      <p className="form-consent">
        <Trans i18nKey="curriculum.informativa" components={{ privacyLink: <a href={INFORMATIVA_CANDIDATI_URL} target="_blank" rel="noopener noreferrer" hrefLang="it" /> }} />
      </p>
      <div className="hp" aria-hidden="true">
        <input type="text" name={mode.honeypot} tabIndex={-1} autoComplete="off" data-1p-ignore data-lpignore="true" data-bwignore="true" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>
      {alertText && (
        <p role="alert" className="form-alert">
          {alertText}
        </p>
      )}
      <Button type="submit" className="form-submit" disabled={!hydrated || sendingNow}>
        {sendingNow ? t("curriculum.submitting") : t("curriculum.submit")}
      </Button>
    </form>
  )
}
