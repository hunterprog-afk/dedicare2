import type { i18n as I18n } from "i18next"

/**
 * Client per gli endpoint pubblici del bot aziendale (`report-ore-bot`, Node
 * nativo su Fly.io regione fra/Francoforte) che hanno sostituito il
 * precedente fornitore terzo di modulistica per i due moduli del sito —
 * candidatura "Lavora con noi" e contatti. Il bot inoltra via Microsoft
 * Graph `sendMail` app-only a info@dedicaresolutions.it, senza persistenza
 * né sub-fornitori terzi di modulistica (nessun OpenAI nel percorso dati).
 *
 * Il fornitore precedente è stato dismesso il 2026-09: certificato Privacy
 * Shield dal 2019, ritirato il 26/04/2022, mai entrato nel Data Privacy
 * Framework; nessun DPA pubblico agli atti — vedi
 * CONTRATTO-moduli-sito-m365.md §0 e il devlog legale del 2026-09-05 per il
 * dettaglio della verifica.
 *
 * Contratto API vincolante: CONTRATTO-moduli-sito-m365.md §1/§2 (condiviso
 * col repo report-ore-bot, che implementa il server).
 */

// `.replace(/\/+$/, "")` tollera uno slash finale nella variabile d'ambiente
// (es. "http://localhost:3000/"), evitando endpoint con "//public/..." se
// qualcuno la valorizza con la barra finale.
export const FORMS_API_BASE: string = (
  (import.meta.env.VITE_FORMS_API_BASE as string | undefined) ??
  "https://dedicare-report-ore-bot.fly.dev"
).replace(/\/+$/, "")

export const CANDIDATURA_ENDPOINT = `${FORMS_API_BASE}/public/candidatura`
export const CONTATTO_ENDPOINT = `${FORMS_API_BASE}/public/contatto`

/** Pagina statica pubblicata in public/informativa-candidati.html. */
export const INFORMATIVA_CANDIDATI_URL = "/informativa-candidati.html"

/**
 * Versione dell'informativa dichiarata al momento dell'invio: viene inoltrata
 * al bot e finisce nell'e-mail generata (riga finale, prova ex art. 5.2
 * GDPR di quale versione dell'informativa era collegata al modulo — vedi
 * contratto §4). Aggiornare quando cambia il testo pubblicato in
 * public/informativa-candidati.html.
 */
export const INFORMATIVA_CANDIDATI_VERSIONE = "candidati-v1.0-2026-09"

/**
 * Stessa logica per il modulo contatti, che rimanda invece alla Privacy
 * Policy generale (LegalModal / src/content/legal.ts) e non alla pagina
 * statica candidati.
 */
export const PRIVACY_POLICY_VERSIONE = "privacy-policy-2026-09"

/** Chiavi i18n condivise dalle mappe di errore dei due moduli. */
export type CandidaturaErrorKey =
  | "error_required"
  | "error_rate_limit"
  | "error_filesize"
  | "error_filetype"
  | "error_send"

export type ContattoErrorKey = "error_required" | "error_rate_limit" | "error_send"

/**
 * Mappa lo status HTTP di risposta di `POST /public/candidatura` (vedi
 * contratto §1) alla chiave i18n del namespace `curriculum` da mostrare.
 * Il messaggio viene scelto SOLO in base allo status: il corpo JSON di
 * errore del bot porta codici macchina (`"validazione"`, `"troppo_grande"`,
 * ...), non testo per l'utente finale.
 */
export function mapCandidaturaErrorKey(status: number): CandidaturaErrorKey {
  switch (status) {
    case 400:
      return "error_required"
    case 413:
      return "error_filesize"
    case 415:
      return "error_filetype"
    case 429:
      return "error_rate_limit"
    default:
      return "error_send"
  }
}

/** Stessa logica di {@link mapCandidaturaErrorKey} per `POST /public/contatto`
 *  (namespace i18n `contactform`, che non ha una chiave `error_filesize`
 *  poiché il modulo contatti non allega file). */
export function mapContattoErrorKey(status: number): ContattoErrorKey {
  switch (status) {
    case 400:
      return "error_required"
    case 429:
      return "error_rate_limit"
    default:
      return "error_send"
  }
}

/** Regex di validazione client dell'indirizzo e-mail, condivisa dai due
 *  moduli (curriculum e contatti): niente CR/LF, un solo "@", dominio con
 *  un punto. È solo un filtro lato UI — la validazione che conta è quella
 *  server-side descritta nel contratto §3.4. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Valida un indirizzo e-mail lato client (stessa regex per entrambi i moduli). */
export function isEmailValida(email: string): boolean {
  return EMAIL_REGEX.test(email.trim())
}

/** Codice lingua a 2 lettere (`it`/`en`) da inviare al bot nel campo
 *  `lingua`, derivato dall'istanza `i18n` di react-i18next. Stessa logica
 *  per entrambi i moduli. */
export function linguaCorrente(i18n: Pick<I18n, "resolvedLanguage" | "language">): string {
  return (i18n.resolvedLanguage ?? i18n.language ?? "it").slice(0, 2)
}
