import { useState, type FormEvent, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"

// NOTE: sostituire "XXXXXXXX" con l'endpoint reale ottenuto da formspree.io
const FORMSPREE_ENDPOINT = "https://formspree.io/f/XXXXXXXX"

type FormStatus = "idle" | "loading" | "success" | "error"

interface FormFields {
  nome: string
  telefono: string
  email: string
  messaggio: string
  privacy: boolean
}

const INITIAL_FIELDS: FormFields = {
  nome: "",
  telefono: "",
  email: "",
  messaggio: "",
  privacy: false,
}

export function ContactForm() {
  const [fields, setFields] = useState<FormFields>(INITIAL_FIELDS)
  const [status, setStatus] = useState<FormStatus>("idle")
  const [errorMsg, setErrorMsg] = useState<string>("")

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      setFields((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }))
    } else {
      setFields((prev) => ({ ...prev, [name]: value }))
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!fields.privacy) return

    setStatus("loading")
    setErrorMsg("")

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          nome: fields.nome,
          telefono: fields.telefono,
          email: fields.email,
          messaggio: fields.messaggio,
        }),
      })

      if (res.ok) {
        setStatus("success")
        setFields(INITIAL_FIELDS)
      } else {
        const data = await res.json().catch(() => ({}))
        setErrorMsg(
          (data as { error?: string }).error ??
            "Invio fallito. Riprova o contattaci direttamente."
        )
        setStatus("error")
      }
    } catch {
      setErrorMsg("Errore di rete. Controlla la connessione e riprova.")
      setStatus("error")
    }
  }

  /* ------------------------------------------------------------------ */
  const inputBase =
    "w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 font-body outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
  const labelBase = "block text-xs font-body text-white/70 mb-1.5"

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-[hsl(210,30%,8%)]/80 border border-white/10 p-8 text-center">
        <div className="mb-4 flex justify-center">
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/20 text-primary text-3xl">
            ✓
          </span>
        </div>
        <p className="font-display italic text-2xl text-white mb-2">Messaggio inviato!</p>
        <p className="font-body text-sm text-white/60">
          Ti risponderemo al più presto. Grazie per averci contattato.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-xs font-body text-primary/70 hover:text-primary transition-colors underline underline-offset-2"
        >
          Invia un altro messaggio
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl bg-[hsl(210,30%,8%)]/80 border border-white/10 p-6 md:p-8 flex flex-col gap-5"
    >
      <p className="font-display italic text-xl text-white/90 mb-1">
        Oppure scrivici direttamente
      </p>

      {/* Nome */}
      <div>
        <label htmlFor="cf-nome" className={labelBase}>
          Nome <span className="text-primary">*</span>
        </label>
        <input
          id="cf-nome"
          name="nome"
          type="text"
          required
          autoComplete="name"
          placeholder="Mario Rossi"
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
            Telefono
          </label>
          <input
            id="cf-telefono"
            name="telefono"
            type="tel"
            autoComplete="tel"
            placeholder="+39 333 000 0000"
            value={fields.telefono}
            onChange={handleChange}
            disabled={status === "loading"}
            className={inputBase}
          />
        </div>
        <div>
          <label htmlFor="cf-email" className={labelBase}>
            Email <span className="text-primary">*</span>
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="mario@esempio.it"
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
          Messaggio <span className="text-primary">*</span>
        </label>
        <textarea
          id="cf-messaggio"
          name="messaggio"
          required
          rows={4}
          placeholder="Raccontaci di cosa avete bisogno…"
          value={fields.messaggio}
          onChange={handleChange}
          disabled={status === "loading"}
          className={`${inputBase} resize-none`}
        />
      </div>

      {/* Privacy checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          name="privacy"
          type="checkbox"
          required
          checked={fields.privacy}
          onChange={handleChange}
          disabled={status === "loading"}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border border-white/20 bg-white/5 accent-primary cursor-pointer"
        />
        <span className="font-body text-xs text-white/50 group-hover:text-white/70 transition-colors leading-relaxed">
          Acconsento al trattamento dei dati personali ai sensi del GDPR (Reg. UE 2016/679)
          <span className="text-primary"> *</span>
        </span>
      </label>

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
        disabled={status === "loading" || !fields.privacy}
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
            Invio in corso…
          </span>
        ) : (
          "Invia messaggio"
        )}
      </Button>
    </form>
  )
}
