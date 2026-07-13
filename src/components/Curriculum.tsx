import { useState, type FormEvent, type ChangeEvent } from "react"
import { motion } from "motion/react"
import { GraduationCap, Heart, ShieldCheck, Sparkles, Upload, Briefcase } from "lucide-react"
import { useTranslation } from "react-i18next"
import { BlurText } from "@/components/BlurText"
import { Button } from "@/components/ui/button"

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mkoybjyb"
const MAX_FILE_BYTES = 5 * 1024 * 1024

type FormStatus = "idle" | "loading" | "success" | "error"

interface CurriculumFields {
  nome: string
  cognome: string
  email: string
  telefono: string
  posizione: string
  messaggio: string
  privacy: boolean
}

const INITIAL_FIELDS: CurriculumFields = {
  nome: "",
  cognome: "",
  email: "",
  telefono: "",
  posizione: "",
  messaggio: "",
  privacy: false,
}

type TranslatedReason = { title: string; body: string }
type PositionKey = "oss" | "infermiere" | "fisioterapista" | "badante" | "altro"
const POSITION_KEYS: PositionKey[] = ["oss", "infermiere", "fisioterapista", "badante", "altro"]
const REASON_ICONS = [GraduationCap, Heart, ShieldCheck, Sparkles]

export function Curriculum() {
  const { t, i18n } = useTranslation()
  const reasons = t("curriculum.reasons", { returnObjects: true }) as TranslatedReason[]

  const [fields, setFields] = useState<CurriculumFields>(INITIAL_FIELDS)
  const [cv, setCv] = useState<File | null>(null)
  const [status, setStatus] = useState<FormStatus>("idle")
  const [errorMsg, setErrorMsg] = useState<string>("")

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
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

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    setErrorMsg("")
    const file = e.target.files?.[0] ?? null
    if (!file) {
      setCv(null)
      return
    }
    if (file.type !== "application/pdf") {
      setErrorMsg(t("curriculum.error_filetype"))
      setCv(null)
      e.target.value = ""
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setErrorMsg(t("curriculum.error_filesize"))
      setCv(null)
      e.target.value = ""
      return
    }
    setCv(file)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!fields.privacy) return

    setStatus("loading")
    setErrorMsg("")

    try {
      const body = new FormData()
      body.append("_subject", "Candidatura — Lavora con noi")
      body.append("nome", fields.nome)
      body.append("cognome", fields.cognome)
      body.append("email", fields.email)
      body.append("telefono", fields.telefono)
      body.append("posizione", fields.posizione)
      body.append("messaggio", fields.messaggio)
      if (cv) body.append("cv", cv, cv.name)

      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body,
      })

      if (res.ok) {
        setStatus("success")
        setFields(INITIAL_FIELDS)
        setCv(null)
      } else {
        const data = await res.json().catch(() => ({}))
        setErrorMsg(
          (data as { error?: string }).error ?? t("curriculum.error_send")
        )
        setStatus("error")
      }
    } catch {
      setErrorMsg(t("curriculum.error_network"))
      setStatus("error")
    }
  }

  const inputBase =
    "w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 font-body outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
  const labelBase = "block text-xs font-body text-white/70 mb-1.5"

  return (
    <section
      id="lavora-con-noi"
      data-section="light"
      className="relative py-16 md:py-40"
    >
      <div className="max-w-[var(--max)] mx-auto px-[var(--gutter)]">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-foreground/80 inline-flex items-center gap-2">
            <Briefcase className="size-3.5" />
            {t("curriculum.eyebrow")}
          </span>
          <BlurText
            key={i18n.language + "-curriculum-title"}
            text={t("curriculum.title")}
            as="h2"
            className="mt-4 font-display uppercase text-[clamp(32px,8vw,60px)] md:text-6xl leading-[0.95] md:leading-[0.9] tracking-tight max-w-[20ch] break-words"
            delay={0.07}
          />
          <motion.p
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="mt-4 font-body text-foreground/60 text-base max-w-[52ch] leading-relaxed"
          >
            {t("curriculum.intro")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* SX: motivi */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-5"
          >
            <h3 className="font-display uppercase text-xl tracking-tight">
              {t("curriculum.reasons_title")}
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reasons.map((r, i) => {
                const Icon = REASON_ICONS[i] ?? Sparkles
                return (
                  <li
                    key={r.title}
                    className="liquid-glass rounded-2xl p-5 flex flex-col gap-3"
                  >
                    <div className="liquid-glass-strong rounded-full w-10 h-10 flex items-center justify-center">
                      <Icon className="size-4 text-foreground" />
                    </div>
                    <h4 className="font-display uppercase text-base tracking-tight">
                      {r.title}
                    </h4>
                    <p className="font-body text-sm text-foreground/65 leading-relaxed">
                      {r.body}
                    </p>
                  </li>
                )
              })}
            </ul>
          </motion.div>

          {/* DX: form */}
          <motion.form
            onSubmit={handleSubmit}
            noValidate
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="rounded-2xl bg-[hsl(222,35%,13%)]/95 border border-white/10 p-6 md:p-8 flex flex-col gap-5 shadow-xl shadow-black/10"
          >
            {status === "success" ? (
              <div className="text-center py-6">
                <div className="mb-4 flex justify-center">
                  <span className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/20 text-primary text-3xl">
                    ✓
                  </span>
                </div>
                <p className="font-display italic text-2xl text-white mb-2">
                  {t("curriculum.success_title")}
                </p>
                <p className="font-body text-sm text-white/60">
                  {t("curriculum.success_body")}
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-6 text-xs font-body text-primary/70 hover:text-primary transition-colors underline underline-offset-2"
                >
                  {t("curriculum.success_retry")}
                </button>
              </div>
            ) : (
              <>
                <p className="font-display italic text-xl text-white/90 mb-1">
                  {t("curriculum.form_title")}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="cv-nome" className={labelBase}>
                      {t("curriculum.nome")} <span className="text-primary">*</span>
                    </label>
                    <input
                      id="cv-nome"
                      name="nome"
                      type="text"
                      required
                      autoComplete="given-name"
                      value={fields.nome}
                      onChange={handleChange}
                      disabled={status === "loading"}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label htmlFor="cv-cognome" className={labelBase}>
                      {t("curriculum.cognome")} <span className="text-primary">*</span>
                    </label>
                    <input
                      id="cv-cognome"
                      name="cognome"
                      type="text"
                      required
                      autoComplete="family-name"
                      value={fields.cognome}
                      onChange={handleChange}
                      disabled={status === "loading"}
                      className={inputBase}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="cv-email" className={labelBase}>
                      {t("curriculum.email")} <span className="text-primary">*</span>
                    </label>
                    <input
                      id="cv-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={fields.email}
                      onChange={handleChange}
                      disabled={status === "loading"}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label htmlFor="cv-telefono" className={labelBase}>
                      {t("curriculum.telefono")}
                    </label>
                    <input
                      id="cv-telefono"
                      name="telefono"
                      type="tel"
                      autoComplete="tel"
                      value={fields.telefono}
                      onChange={handleChange}
                      disabled={status === "loading"}
                      className={inputBase}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="cv-posizione" className={labelBase}>
                    {t("curriculum.posizione")} <span className="text-primary">*</span>
                  </label>
                  <select
                    id="cv-posizione"
                    name="posizione"
                    required
                    value={fields.posizione}
                    onChange={handleChange}
                    disabled={status === "loading"}
                    className={inputBase}
                  >
                    <option value="" disabled className="bg-white text-neutral-500">
                      {t("curriculum.posizione_placeholder")}
                    </option>
                    {POSITION_KEYS.map((k) => (
                      <option key={k} value={t(`curriculum.posizioni.${k}`)} className="bg-white text-neutral-900">
                        {t(`curriculum.posizioni.${k}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="cv-messaggio" className={labelBase}>
                    {t("curriculum.messaggio")}
                  </label>
                  <textarea
                    id="cv-messaggio"
                    name="messaggio"
                    rows={4}
                    placeholder={t("curriculum.placeholder_messaggio")}
                    value={fields.messaggio}
                    onChange={handleChange}
                    disabled={status === "loading"}
                    className={`${inputBase} resize-none`}
                  />
                </div>

                <div>
                  <span className={labelBase}>{t("curriculum.cv")}</span>
                  <label
                    htmlFor="cv-file"
                    className="flex items-center gap-3 rounded-lg border border-dashed border-white/15 bg-white/[0.03] px-4 py-3 cursor-pointer hover:bg-white/[0.06] transition-colors"
                  >
                    <Upload className="size-4 text-primary/80" />
                    <span className="font-body text-sm text-primary/90 underline underline-offset-2">
                      {t("curriculum.cv_select")}
                    </span>
                    <span className="font-body text-xs text-white/50 truncate">
                      {cv ? cv.name : t("curriculum.cv_none")}
                    </span>
                    <input
                      id="cv-file"
                      name="cv"
                      type="file"
                      accept="application/pdf"
                      onChange={handleFile}
                      disabled={status === "loading"}
                      className="sr-only"
                    />
                  </label>
                </div>

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
                    {t("curriculum.gdpr")}
                    <span className="text-primary"> *</span>
                  </span>
                </label>

                {status === "error" && errorMsg && (
                  <p
                    role="alert"
                    className="text-xs font-body text-red-400 bg-red-900/20 border border-red-500/20 rounded-lg px-4 py-2"
                  >
                    {errorMsg}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="hero"
                  disabled={status === "loading" || !fields.privacy}
                  className="w-full mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "loading"
                    ? t("curriculum.submitting")
                    : t("curriculum.submit")}
                </Button>
              </>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  )
}
