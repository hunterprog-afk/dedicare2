import { useId, type ReactNode } from "react"
import { useTranslation } from "@/i18n/react"
import type { FieldError } from "@/lib/validation"
import "./forms.css"

interface FieldBase {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: FieldError
  /** Limite in caratteri, anche per il messaggio «troppo lungo». */
  max: number
  required?: boolean
  hint?: string
  placeholder?: string
  autoComplete?: string
  className?: string
}

type FieldProps =
  | (FieldBase & { as?: "input"; type?: "text" | "email" | "tel" })
  | (FieldBase & { as: "textarea" })
  | (FieldBase & { as: "select"; children: ReactNode })

/** Campo con etichetta sempre visibile, aiuto e errore collegati con `aria-describedby`. */
export function Field(props: FieldProps) {
  const { t } = useTranslation()
  const uid = useId()
  const { name, label, value, onChange, onBlur, error, max, required, hint, placeholder, autoComplete, className } = props
  const id = `${uid}-${name}`
  const errId = `${id}-err`
  const hintId = `${id}-hint`
  const describedBy = [error ? errId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined
  const common = {
    id,
    name,
    value,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": describedBy,
    "aria-required": required ? (true as const) : undefined,
    onBlur,
    className: "field-control",
  }
  const message = error ? (error === "required" ? t("form.field_required") : error === "email" ? t("form.field_email") : t("form.field_too_long", { max })) : null

  return (
    <div className={["field", className].filter(Boolean).join(" ")}>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {props.as === "textarea" ? (
        <textarea {...common} maxLength={max} placeholder={placeholder} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} />
      ) : props.as === "select" ? (
        <select {...common} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)}>
          {props.children}
        </select>
      ) : (
        <input {...common} type={props.type ?? "text"} maxLength={max} placeholder={placeholder} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} />
      )}
      {message && (
        <p id={errId} className="field-error">
          {message}
        </p>
      )}
      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
    </div>
  )
}
