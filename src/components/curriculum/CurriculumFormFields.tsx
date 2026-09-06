import { type ChangeEvent } from "react"
import { Upload } from "lucide-react"
import { Trans, useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { INFORMATIVA_CANDIDATI_URL } from "@/lib/formsApi"
import type { CurriculumFields, FormStatus } from "@/hooks/useCurriculumForm"

type PositionKey = "oss" | "infermiere" | "fisioterapista" | "badante" | "altro"
const POSITION_KEYS: PositionKey[] = ["oss", "infermiere", "fisioterapista", "badante", "altro"]

const inputBase =
  "w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 font-body outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
const labelBase = "block text-xs font-body text-white/70 mb-1.5"

interface CurriculumFormFieldsProps {
  fields: CurriculumFields
  cv: File | null
  status: FormStatus
  errorMsg: string
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void
  onFile: (e: ChangeEvent<HTMLInputElement>) => void
}

/** Campi del form di candidatura + upload CV + submit. Markup puro: tutto
 *  lo stato/la logica vive in useCurriculumForm, passato come props da
 *  CurriculumForm.
 *
 *  2026-09: via la checkbox "privacy" (per i curricula il consenso non è
 *  dovuto, art. 111-bis Codice Privacy) — sostituita da una dichiarazione di
 *  presa visione con link all'informativa candidati dedicata (paragrafo
 *  `Trans`, MAI `dangerouslySetInnerHTML`). Aggiunto hint sotto il campo CV
 *  e un honeypot anti-spam invisibile (`sito_web`) fuori dal tab order. */
export function CurriculumFormFields({
  fields,
  cv,
  status,
  errorMsg,
  onChange,
  onFile,
}: CurriculumFormFieldsProps) {
  const { t } = useTranslation()
  const disabled = status === "loading"

  return (
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
            maxLength={100}
            value={fields.nome}
            onChange={onChange}
            disabled={disabled}
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
            maxLength={100}
            value={fields.cognome}
            onChange={onChange}
            disabled={disabled}
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
            maxLength={254}
            value={fields.email}
            onChange={onChange}
            disabled={disabled}
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
            maxLength={40}
            value={fields.telefono}
            onChange={onChange}
            disabled={disabled}
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
          onChange={onChange}
          disabled={disabled}
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
          maxLength={5000}
          placeholder={t("curriculum.placeholder_messaggio")}
          value={fields.messaggio}
          onChange={onChange}
          disabled={disabled}
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
            onChange={onFile}
            disabled={disabled}
            aria-describedby="cv-file-hint"
            className="sr-only"
          />
        </label>
        <p id="cv-file-hint" className="mt-1.5 text-xs font-body text-white/60 leading-relaxed">
          {t("curriculum.hint_cv")}
        </p>
      </div>

      {/* Honeypot anti-spam (contratto §5): invisibile e fuori dal tab order.
          Nessuna label associata (aria-hidden lo nasconde comunque agli
          screen reader, ma qui evitiamo anche solo di scrivere un testo
          visibile collegato). Se valorizzato il bot finge un 200 OK e
          scarta la richiesta. `data-1p-ignore`/`data-lpignore`/
          `data-bwignore` escludono il campo dal riempimento automatico di
          1Password/LastPass/Bitwarden: questi gestori compilano per
          euristica sul `name` (non rispettano autoComplete="off") e un
          candidato reale con un campo "sito_web" precompilato verrebbe
          scartato in silenzio dal bot come honeypot pieno. */}
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
        onChange={onChange}
      />

      <p className="font-body text-xs text-white/50 leading-relaxed">
        <Trans
          i18nKey="curriculum.informativa"
          components={{
            privacyLink: (
              <a
                href={INFORMATIVA_CANDIDATI_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[hsl(207,70%,68%)] hover:text-white underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
              />
            ),
          }}
        />
        {/* Trans sostituisce i figli del placemarker con il testo tradotto:
            non è possibile annidare qui uno <span> aggiuntivo dentro l'<a>
            (vedi CONTRATTO-moduli-sito-m365.md ADDENDUM 1). L'annuncio che
            il link apre una nuova scheda segue quindi nello stesso
            paragrafo, invece che dentro l'elemento <a>. */}
        <span className="sr-only"> (si apre in una nuova scheda)</span>
      </p>

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
        disabled={status === "loading"}
        className="w-full mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? t("curriculum.submitting") : t("curriculum.submit")}
      </Button>
    </>
  )
}
