import { LIMITI, isEmailValida } from "./formsApi"

export type FieldError = "required" | "email" | "too_long"

export interface Rule {
  required?: boolean
  email?: boolean
  max: number
}

/** Un solo punto di verità per i controlli di campo: stessi limiti di `maxLength` e dell'invio. */
export function validateValue(value: string, rule: Rule): FieldError | null {
  const v = value.trim()
  if (rule.required && v === "") return "required"
  if (v !== "" && rule.email && !isEmailValida(v)) return "email"
  if (value.length > rule.max) return "too_long"
  return null
}

export const CONTATTO_RULES = {
  nome: { required: true, max: LIMITI.nome },
  telefono: { max: LIMITI.telefono },
  email: { required: true, email: true, max: LIMITI.email },
  messaggio: { required: true, max: LIMITI.messaggio },
} as const satisfies Record<string, Rule>

export const CANDIDATURA_RULES = {
  nome: { required: true, max: LIMITI.nome },
  cognome: { required: true, max: LIMITI.cognome },
  email: { required: true, email: true, max: LIMITI.email },
  telefono: { max: LIMITI.telefono },
  posizione: { required: true, max: LIMITI.posizione },
  messaggio: { max: LIMITI.messaggio },
} as const satisfies Record<string, Rule>

export type CvCheck = "ok" | "error_filesize" | "error_filetype"

/** PDF per tipo e per estensione, entro 5 MB. */
export function checkCv(file: File): CvCheck {
  if (file.type !== "application/pdf" || !/\.pdf$/i.test(file.name)) return "error_filetype"
  if (file.size > LIMITI.cvBytes) return "error_filesize"
  return "ok"
}
