import { type ChangeEvent } from "react"
import { Upload } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
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
 *  CurriculumForm. */
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
          onChange={onChange}
          disabled={disabled}
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
        {status === "loading" ? t("curriculum.submitting") : t("curriculum.submit")}
      </Button>
    </>
  )
}
