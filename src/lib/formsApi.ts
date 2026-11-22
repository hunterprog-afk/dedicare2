// Client dei due moduli del sito. Due modalità decise in build:
// VITE_FORMS_API_BASE definita → endpoint M365 (contratto moduli del 06/09/2026);
// non definita → Formspree.
import type { Lang } from "@/routes"

export const FORMSPREE_ENDPOINT = "https://formspree.io/f/mkoybjyb"
export const INFORMATIVA_CANDIDATI_URL = "/informativa-candidati.html"
export const INFORMATIVA_CANDIDATI_VERSIONE = "candidati-v1.1-2026-10"
export const PRIVACY_POLICY_URL = "/privacy/"
export const PRIVACY_POLICY_VERSIONE = "privacy-policy-2026-10"
export const LIMITI = {
  nome: 100,
  cognome: 100,
  email: 254,
  telefono: 40,
  posizione: 80,
  messaggio: 5000,
  cvBytes: 5 * 1024 * 1024,
  cvNome: 120,
} as const

/** Etichette italiane delle posizioni: è ciò che riceve chi legge la candidatura, in qualunque lingua della pagina. */
export const POSIZIONI_INVIATE = {
  oss: "Operatore Socio Sanitario (OSS)",
  infermiere: "Infermiere",
  fisioterapista: "Fisioterapista",
  assistente: "Assistente familiare",
  altro: "Altro",
} as const

export type FormsMode =
  | { kind: "m365"; contatto: string; candidatura: string; honeypot: "sito_web" }
  | { kind: "formspree"; contatto: string; candidatura: string; honeypot: "_gotcha" }

export function getFormsMode(env: { VITE_FORMS_API_BASE?: string } = import.meta.env): FormsMode {
  const base = env.VITE_FORMS_API_BASE?.trim().replace(/\/+$/, "")
  if (base) {
    return { kind: "m365", contatto: `${base}/public/contatto`, candidatura: `${base}/public/candidatura`, honeypot: "sito_web" }
  }
  return { kind: "formspree", contatto: FORMSPREE_ENDPOINT, candidatura: FORMSPREE_ENDPOINT, honeypot: "_gotcha" }
}

export type CandidaturaErrorKey = "error_required" | "error_rate_limit" | "error_filesize" | "error_filetype" | "error_send"
export type ContattoErrorKey = "error_required" | "error_rate_limit" | "error_send"

export function mapCandidaturaErrorKey(status: number): CandidaturaErrorKey {
  if (status === 400 || status === 422) return "error_required"
  if (status === 413) return "error_filesize"
  if (status === 415) return "error_filetype"
  if (status === 429) return "error_rate_limit"
  return "error_send"
}

export function mapContattoErrorKey(status: number): ContattoErrorKey {
  if (status === 400 || status === 422) return "error_required"
  if (status === 429) return "error_rate_limit"
  return "error_send"
}

export function isEmailValida(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export interface ContattoInput {
  nome: string
  telefono: string
  email: string
  messaggio: string
  honeypot: string
}

export interface CandidaturaInput {
  nome: string
  cognome: string
  email: string
  telefono: string
  /** Etichetta italiana della posizione, anche dalla pagina inglese. */
  posizione: string
  messaggio: string
  cv: File | null
  honeypot: string
}

export type SubmitResult<K extends string> = { ok: true } | { ok: false; key: K | "error_network" }

/** Invia il modulo contatti. Legge la modalità al momento dell'invio. */
export async function inviaContatto(input: ContattoInput, lingua: Lang): Promise<SubmitResult<ContattoErrorKey>> {
  const mode = getFormsMode()
  const body: Record<string, string> = {
    nome: input.nome.trim(),
    telefono: input.telefono.trim(),
    email: input.email.trim(),
    messaggio: input.messaggio.trim(),
    [mode.honeypot]: input.honeypot,
    lingua,
    informativa_versione: PRIVACY_POLICY_VERSIONE,
  }
  try {
    const res = await fetch(mode.contatto, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    })
    return res.ok ? { ok: true } : { ok: false, key: mapContattoErrorKey(res.status) }
  } catch {
    return { ok: false, key: "error_network" }
  }
}

/** Invia la candidatura (multipart). Il browser imposta da solo il confine del `Content-Type`. */
export async function inviaCandidatura(input: CandidaturaInput, lingua: Lang): Promise<SubmitResult<CandidaturaErrorKey>> {
  const mode = getFormsMode()
  const fd = new FormData()
  fd.append("nome", input.nome.trim())
  fd.append("cognome", input.cognome.trim())
  fd.append("email", input.email.trim())
  fd.append("telefono", input.telefono.trim())
  fd.append("posizione", input.posizione.trim())
  fd.append("messaggio", input.messaggio.trim())
  if (input.cv) {
    const nomeSicuro = input.cv.name.length > LIMITI.cvNome ? "curriculum.pdf" : input.cv.name
    fd.append("cv", input.cv, nomeSicuro)
  }
  fd.append(mode.honeypot, input.honeypot)
  fd.append("lingua", lingua)
  fd.append("informativa_versione", INFORMATIVA_CANDIDATI_VERSIONE)
  if (mode.kind === "formspree") fd.append("_subject", "Candidatura — Lavora con noi")
  try {
    const res = await fetch(mode.candidatura, { method: "POST", headers: { Accept: "application/json" }, body: fd })
    return res.ok ? { ok: true } : { ok: false, key: mapCandidaturaErrorKey(res.status) }
  } catch {
    return { ok: false, key: "error_network" }
  }
}
