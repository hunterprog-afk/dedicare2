import { useState, type FormEvent, type ChangeEvent } from "react"
import { useTranslation } from "react-i18next"
import {
  CANDIDATURA_ENDPOINT,
  INFORMATIVA_CANDIDATI_VERSIONE,
  isEmailValida,
  linguaCorrente,
  mapCandidaturaErrorKey,
} from "@/lib/formsApi"

const MAX_FILE_BYTES = 5 * 1024 * 1024

export type FormStatus = "idle" | "loading" | "success" | "error"

export interface CurriculumFields {
  nome: string
  cognome: string
  email: string
  telefono: string
  posizione: string
  messaggio: string
  /** Honeypot anti-spam (campo `sito_web` del contratto §1/§3.1): deve
   *  restare vuoto. Un valore non vuoto fa scartare la richiesta lato bot
   *  (che comunque risponde 200 per non rivelare il filtro all'eventuale bot). */
  sito_web: string
}

const INITIAL_FIELDS: CurriculumFields = {
  nome: "",
  cognome: "",
  email: "",
  telefono: "",
  posizione: "",
  messaggio: "",
  sito_web: "",
}

/**
 * Stato e logica del form di candidatura "Lavora con noi" (validazione
 * campi, upload CV, submit). Estratto da Curriculum.tsx per isolare la
 * logica dal markup (vedi 06 - Prossimi passi / DECISION-NEEDED
 * no-giant-component nel report react-doctor 2026-07-14).
 *
 * Fix 2026-07-14: `handleFile` ora imposta anche `status="error"` quando la
 * validazione del file (tipo/dimensione) fallisce, cosicché il paragrafo
 * role="alert" in CurriculumFormFields (gated su `status === "error" &&
 * errorMsg`) sia effettivamente visibile. In precedenza veniva impostato
 * solo `errorMsg`, con reset silenzioso dell'input e nessun feedback
 * all'utente — vedi Curriculum.test.tsx per i test aggiornati.
 * `handleFile` resetta anche `status` a "idle" a ogni chiamata (prima di
 * validare) cosí un file valido, o anche l'annullamento della selezione,
 * ripulisce coerentemente un errore precedente (di file o di submit).
 *
 * 2026-09: submit migrato dal precedente fornitore terzo di modulistica
 * all'endpoint pubblico del bot aziendale (CONTRATTO-moduli-sito-m365.md
 * §1/§5) — niente più checkbox
 * "privacy": per i curricula il consenso non è dovuto (art. 111-bis Codice
 * Privacy), sostituita da una dichiarazione di presa visione dell'apposita
 * informativa (vedi CurriculumFormFields). Aggiunta validazione client dei
 * campi obbligatori (prima li validava solo `required` HTML, mai applicato
 * perché il form ha `noValidate`) e honeypot anti-spam `sito_web`.
 */
export function useCurriculumForm() {
  const { t, i18n } = useTranslation()

  const [fields, setFields] = useState<CurriculumFields>(INITIAL_FIELDS)
  const [cv, setCv] = useState<File | null>(null)
  const [status, setStatus] = useState<FormStatus>("idle")
  const [errorMsg, setErrorMsg] = useState<string>("")

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    setErrorMsg("")
    setStatus("idle")
    const file = e.target.files?.[0] ?? null
    if (!file) {
      setCv(null)
      return
    }
    if (file.type !== "application/pdf") {
      setErrorMsg(t("curriculum.error_filetype"))
      setStatus("error")
      setCv(null)
      e.target.value = ""
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setErrorMsg(t("curriculum.error_filesize"))
      setStatus("error")
      setCv(null)
      e.target.value = ""
      return
    }
    setCv(file)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const campiObbligatoriValidi =
      fields.nome.trim() !== "" &&
      fields.cognome.trim() !== "" &&
      isEmailValida(fields.email) &&
      fields.posizione.trim() !== ""

    if (!campiObbligatoriValidi) {
      setErrorMsg(t("curriculum.error_required"))
      setStatus("error")
      return
    }

    setStatus("loading")
    setErrorMsg("")

    try {
      const body = new FormData()
      body.append("nome", fields.nome)
      body.append("cognome", fields.cognome)
      body.append("email", fields.email)
      body.append("telefono", fields.telefono)
      body.append("posizione", fields.posizione)
      body.append("messaggio", fields.messaggio)
      if (cv) body.append("cv", cv, cv.name)
      body.append("sito_web", fields.sito_web)
      body.append("lingua", linguaCorrente(i18n))
      body.append("informativa_versione", INFORMATIVA_CANDIDATI_VERSIONE)

      const res = await fetch(CANDIDATURA_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body,
      })

      if (res.ok) {
        setStatus("success")
        setFields(INITIAL_FIELDS)
        setCv(null)
      } else {
        setErrorMsg(t(`curriculum.${mapCandidaturaErrorKey(res.status)}`))
        setStatus("error")
      }
    } catch {
      setErrorMsg(t("curriculum.error_network"))
      setStatus("error")
    }
  }

  function resetToIdle() {
    setStatus("idle")
  }

  return {
    fields,
    cv,
    status,
    errorMsg,
    handleChange,
    handleFile,
    handleSubmit,
    resetToIdle,
  }
}

export type UseCurriculumFormReturn = ReturnType<typeof useCurriculumForm>
