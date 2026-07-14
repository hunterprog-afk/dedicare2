import { useState, type FormEvent, type ChangeEvent } from "react"
import { useTranslation } from "react-i18next"

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mkoybjyb"
const MAX_FILE_BYTES = 5 * 1024 * 1024

export type FormStatus = "idle" | "loading" | "success" | "error"

export interface CurriculumFields {
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

/**
 * Stato e logica del form di candidatura "Lavora con noi" (validazione
 * campi, upload CV, submit a Formspree). Estratto da Curriculum.tsx per
 * isolare la logica dal markup (vedi 06 - Prossimi passi / DECISION-NEEDED
 * no-giant-component nel report react-doctor 2026-07-14).
 *
 * Comportamento invariato rispetto all'originale, bug pre-esistente incluso:
 * `handleFile` imposta `errorMsg` ma non `status`, quindi il messaggio di
 * errore di validazione upload (tipo/dimensione file) non viene mai
 * mostrato — vedi Curriculum.test.tsx per la caratterizzazione esplicita.
 * Non corretto qui di proposito: refactor puramente strutturale.
 */
export function useCurriculumForm() {
  const { t } = useTranslation()

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
