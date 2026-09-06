import { useState, type FormEvent, type ChangeEvent } from "react"
import { Trans, useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import {
  CONTATTO_ENDPOINT,
  PRIVACY_POLICY_VERSIONE,
  isEmailValida,
  linguaCorrente,
  mapContattoErrorKey,
} from "@/lib/formsApi"

type FormStatus = "idle" | "loading" | "success" | "error"

interface FormFields {
  nome: string
  telefono: string
  email: string
  messaggio: string
  /** Honeypot anti-spam (contratto §1/§3.1): deve restare vuoto. */
  sito_web: string
}

const INITIAL_FIELDS: FormFields = {
  nome: "",
  telefono: "",
  email: "",
  messaggio: "",
  sito_web: "",
}

interface ContactFormProps {
  /** Apre il modal Privacy Policy (CtaFooter possiede `openLegal("privacy")`). */
  onOpenPrivacy: () => void
}

/**
 * 2026-09: submit migrato dal precedente fornitore terzo di modulistica
 * all'endpoint pubblico del bot aziendale (CONTRATTO-moduli-sito-m365.md
 * §1/§5). Via la checkbox
 * "privacy": sostituita da una dichiarazione di presa visione della Privacy
 * Policy (link che apre il modal esistente, non una nuova pagina). Aggiunta
 * validazione client dei campi obbligatori e honeypot anti-spam `sito_web`.
 */
export function ContactForm({ onOpenPrivacy }: ContactFormProps) {
  const { t, i18n } = useTranslation()
  const [fields, setFields] = useState<FormFields>(INITIAL_FIELDS)
  const [status, setStatus] = useState<FormStatus>("idle")
  const [errorMsg, setErrorMsg] = useState<string>("")

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const campiObbligatoriValidi =
      fields.nome.trim() !== "" &&
      isEmailValida(fields.email) &&
      fields.messaggio.trim() !== ""

    if (!campiObbligatoriValidi) {
      setErrorMsg(t("contactform.error_required"))
      setStatus("error")
      return
    }

    setStatus("loading")
    setErrorMsg("")

    try {
      const res = await fetch(CONTATTO_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          nome: fields.nome,
          telefono: fields.telefono,
          email: fields.email,
          messaggio: fields.messaggio,
          sito_web: fields.sito_web,
          lingua: linguaCorrente(i18n),
          informativa_versione: PRIVACY_POLICY_VERSIONE,
        }),
      })

      if (res.ok) {
        setStatus("success")
        setFields(INITIAL_FIELDS)
      } else {
        setErrorMsg(t(`contactform.${mapContattoErrorKey(res.status)}`))
        setStatus("error")
      }
    } catch {
      setErrorMsg(t("contactform.error_network"))
      setStatus("error")
    }
  }

  /* ------------------------------------------------------------------ */
  const inputBase =
    "w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 font-body outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
  const labelBase = "block text-xs font-body text-white/70 mb-1.5"

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-[hsl(222,35%,11%)]/80 border border-white/10 p-8 text-center">
        <div className="mb-4 flex justify-center">
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/20 text-primary text-3xl">
            ✓
          </span>
        </div>
        <p className="font-display italic text-2xl text-white mb-2">{t("contactform.success_title")}</p>
        <p className="font-body text-sm text-white/60">
          {t("contactform.success_body")}
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-xs font-body text-primary/70 hover:text-primary transition-colors underline underline-offset-2"
        >
          {t("contactform.success_retry")}
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl bg-[hsl(222,35%,11%)]/80 border border-white/10 p-6 md:p-8 flex flex-col gap-5"
    >
      <p className="font-display italic text-xl text-white/90 mb-1">
        {t("contactform.intro")}
      </p>

      {/* Nome */}
      <div>
        <label htmlFor="cf-nome" className={labelBase}>
          {t("contactform.nome")} <span className="text-primary">*</span>
        </label>
        <input
          id="cf-nome"
          name="nome"
          type="text"
          required
          autoComplete="name"
          maxLength={100}
          placeholder={t("contactform.placeholder_nome")}
          value={fields.nome}
          onChange={handleChange}
          disabled={status === "loading"}
          className={inputBase}
        />
      </div>

      {/* Telefono + Email — side by side on md+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="cf-telefono" className={labelBase}>
            {t("contactform.telefono")}
          </label>
          <input
            id="cf-telefono"
            name="telefono"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            placeholder={t("contactform.placeholder_telefono")}
            value={fields.telefono}
            onChange={handleChange}
            disabled={status === "loading"}
            className={inputBase}
          />
        </div>
        <div>
          <label htmlFor="cf-email" className={labelBase}>
            {t("contactform.email")} <span className="text-primary">*</span>
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={254}
            placeholder={t("contactform.placeholder_email")}
            value={fields.email}
            onChange={handleChange}
            disabled={status === "loading"}
            className={inputBase}
          />
        </div>
      </div>

      {/* Messaggio */}
      <div>
        <label htmlFor="cf-messaggio" className={labelBase}>
          {t("contactform.messaggio")} <span className="text-primary">*</span>
        </label>
        <textarea
          id="cf-messaggio"
          name="messaggio"
          required
          rows={4}
          maxLength={5000}
          aria-describedby="cf-messaggio-hint"
          placeholder={t("contactform.placeholder_messaggio")}
          value={fields.messaggio}
          onChange={handleChange}
          disabled={status === "loading"}
          className={`${inputBase} resize-none`}
        />
        <p id="cf-messaggio-hint" className="mt-1.5 text-xs font-body text-white/60 leading-relaxed">
          {t("contactform.hint_salute")}
        </p>
      </div>

      {/* Honeypot anti-spam (contratto §5): invisibile e fuori dal tab order.
          Nessuna label associata a testo visibile. `data-1p-ignore`/
          `data-lpignore`/`data-bwignore` escludono il campo dal riempimento
          automatico di 1Password/LastPass/Bitwarden: questi gestori
          compilano per euristica sul `name` (non rispettano
          autoComplete="off") e un utente reale con un campo "sito_web"
          precompilato verrebbe scartato in silenzio dal bot come honeypot
          pieno. */}
      <input
        name="sito_web"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        data-1p-ignore="true"
        data-lpignore="true"
        data-bwignore="true"
        className="hidden"
        value={fields.sito_web}
        onChange={handleChange}
      />

      <p className="font-body text-xs text-white/50 leading-relaxed">
        <Trans
          i18nKey="contactform.informativa"
          components={{
            privacyLink: (
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="text-[hsl(207,70%,68%)] hover:text-white underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
              />
            ),
          }}
        />
      </p>

      {/* Error message */}
      {status === "error" && errorMsg && (
        <p
          role="alert"
          className="text-xs font-body text-red-400 bg-red-900/20 border border-red-500/20 rounded-lg px-4 py-2"
        >
          {errorMsg}
        </p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        variant="hero"
        disabled={status === "loading"}
        className="w-full mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            {t("contactform.submitting")}
          </span>
        ) : (
          t("contactform.submit")
        )}
      </Button>
    </form>
  )
}
