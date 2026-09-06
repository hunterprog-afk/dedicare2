import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { render } from "@/test/test-utils"
import { Curriculum } from "@/components/Curriculum"
import { CANDIDATURA_ENDPOINT, INFORMATIVA_CANDIDATI_URL, INFORMATIVA_CANDIDATI_VERSIONE } from "@/lib/formsApi"

// Caratterizza il comportamento del form di candidatura dopo lo split in
// sotto-componenti (vedi 06 - Prossimi passi / DECISION-NEEDED
// no-giant-component). Un refactor puramente strutturale deve lasciare
// questi test verdi senza modifiche: se un test qui cambia, è un cambio di
// comportamento, non solo di struttura.
//
// Fix 2026-07-14: i 2 test "upload: rifiuta..." asserivano DI PROPOSITO
// l'assenza dell'alert di errore (bug pre-esistente in `handleFile`, che
// impostava `errorMsg` ma non `status`). Il bug è stato corretto in
// useCurriculumForm.ts — i test ora asseriscono l'alert visibile con il
// messaggio corretto.
//
// 2026-09: migrazione dal precedente fornitore terzo di modulistica
// all'endpoint pubblico del bot aziendale (CONTRATTO-moduli-sito-m365.md
// §1/§5/§8). Via la checkbox "privacy" (per i
// curricula il consenso non è dovuto, art. 111-bis Codice Privacy) —
// sostituita da un link all'informativa candidati dedicata. Aggiunta la
// validazione client dei campi obbligatori (prima demandata solo a
// `required` HTML, mai applicato perché il form ha `noValidate`) e i nuovi
// casi di errore mappati per status HTTP (429/413/503).

function makePdfFile(name = "cv.pdf", sizeBytes = 1024) {
  const bytes = new Uint8Array(sizeBytes)
  return new File([bytes], name, { type: "application/pdf" })
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Nome/), "Maria")
  await user.type(screen.getByLabelText(/^Cognome/), "Rossi")
  await user.type(screen.getByLabelText(/^Email/), "maria.rossi@example.com")
  await user.selectOptions(
    screen.getByLabelText(/^Posizione/),
    "Operatore Socio Sanitario (OSS)"
  )
}

describe("Curriculum — form di candidatura", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("renders tutti i campi del form con le label corrette, senza la checkbox privacy", () => {
    render(<Curriculum />)
    expect(screen.getByLabelText(/^Nome/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Cognome/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Telefono/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Posizione/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Messaggio/)).toBeInTheDocument()
    expect(screen.queryByLabelText(/Acconsento/)).not.toBeInTheDocument()
    const submit = screen.getByRole("button", { name: "Invia candidatura" })
    expect(submit).toBeInTheDocument()
    expect(submit).toBeEnabled()
  })

  it("mostra il link all'informativa privacy candidati (nuova scheda) e l'hint sotto il campo CV", () => {
    render(<Curriculum />)

    const link = screen.getByRole("link", { name: /informativa privacy per i candidati/i })
    expect(link).toHaveAttribute("href", INFORMATIVA_CANDIDATI_URL)
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"))

    expect(
      screen.getByText(/non servono dati sulla salute, convinzioni religiose o politiche/i)
    ).toBeInTheDocument()
  })

  it("upload: accetta un PDF valido sotto i 5MB", async () => {
    const user = userEvent.setup()
    render(<Curriculum />)

    const file = makePdfFile("curriculum.pdf", 2048)
    const input = screen.getByLabelText(/Seleziona file/) as HTMLInputElement
    await user.upload(input, file)

    expect(input.files?.[0]).toBe(file)
    expect(screen.getByText("curriculum.pdf")).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("upload: rifiuta un file non-PDF, resetta l'input e mostra l'errore", async () => {
    // applyAccept: false — l'attributo accept="application/pdf" sull'input
    // è solo un filtro "consigliato" per il selettore di file del SO
    // (bypassabile con "Tutti i file", drag&drop, ecc.), non una validazione
    // reale del browser. user-event lo applica per default e scarterebbe il
    // file PRIMA che raggiunga `handleFile`, mascherando così il branch di
    // validazione tipo-file che questo test vuole esercitare.
    const user = userEvent.setup({ applyAccept: false })
    render(<Curriculum />)

    const file = new File(["x"], "curriculum.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })
    const input = screen.getByLabelText(/Seleziona file/) as HTMLInputElement
    await user.upload(input, file)

    // Fix 2026-07-14 (vedi useCurriculumForm.ts `handleFile`): la validazione
    // del file ora imposta anche `status="error"`, quindi il paragrafo
    // role="alert" con il messaggio è visibile all'utente.
    expect(input.value).toBe("")
    expect(screen.getByText("Nessun file selezionato")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("Formato non supportato. Carica un PDF.")
  })

  it("upload: rifiuta un PDF oltre i 5MB, resetta l'input e mostra l'errore", async () => {
    const user = userEvent.setup()
    render(<Curriculum />)

    const file = makePdfFile("grosso.pdf", 5 * 1024 * 1024 + 1)
    const input = screen.getByLabelText(/Seleziona file/) as HTMLInputElement
    await user.upload(input, file)

    expect(input.value).toBe("")
    expect(screen.getByText("Nessun file selezionato")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("Il file supera i 5MB.")
  })

  it("upload: selezionare un file valido dopo un errore lo accetta comunque e pulisce l'errore", async () => {
    const user = userEvent.setup({ applyAccept: false })
    render(<Curriculum />)

    const input = screen.getByLabelText(/Seleziona file/) as HTMLInputElement
    await user.upload(input, new File(["x"], "bad.txt", { type: "text/plain" }))
    expect(screen.getByText("Nessun file selezionato")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("Formato non supportato. Carica un PDF.")

    await user.upload(input, makePdfFile("ok.pdf"))
    expect(screen.getByText("ok.pdf")).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("submit: senza i campi obbligatori mostra l'errore di validazione e non chiama fetch", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<Curriculum />)

    await user.click(screen.getByRole("button", { name: "Invia candidatura" }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Compila i campi obbligatori (nome, cognome, email valida e posizione)."
      )
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("submit: invia i campi attesi (incluso il file, l'honeypot vuoto, lingua e informativa_versione) all'endpoint del bot", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) })
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<Curriculum />)

    await fillRequiredFields(user)
    await user.type(screen.getByLabelText(/^Telefono/), "3331234567")
    await user.type(screen.getByLabelText(/^Messaggio/), "Disponibile da subito")
    await user.upload(screen.getByLabelText(/Seleziona file/), makePdfFile("cv.pdf"))

    await user.click(screen.getByRole("button", { name: "Invia candidatura" }))

    await waitFor(() => {
      expect(screen.getByText("Candidatura ricevuta!")).toBeInTheDocument()
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(CANDIDATURA_ENDPOINT)
    expect(init.method).toBe("POST")
    expect(init.headers).toMatchObject({ Accept: "application/json" })

    const body = init.body as FormData
    expect(body.get("nome")).toBe("Maria")
    expect(body.get("cognome")).toBe("Rossi")
    expect(body.get("email")).toBe("maria.rossi@example.com")
    expect(body.get("telefono")).toBe("3331234567")
    expect(body.get("posizione")).toBe("Operatore Socio Sanitario (OSS)")
    expect(body.get("messaggio")).toBe("Disponibile da subito")
    expect(body.get("sito_web")).toBe("")
    expect(body.get("lingua")).toBe("it")
    expect(body.get("informativa_versione")).toBe(INFORMATIVA_CANDIDATI_VERSIONE)
    const cvEntry = body.get("cv") as File
    expect(cvEntry.name).toBe("cv.pdf")
  })

  it("submit: senza CV allegato non include il campo cv nel FormData", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) })
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<Curriculum />)

    await fillRequiredFields(user)
    await user.click(screen.getByRole("button", { name: "Invia candidatura" }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const body = fetchMock.mock.calls[0][1].body as FormData
    expect(body.get("cv")).toBeNull()
  })

  it("submit: mostra lo stato di caricamento e disabilita i campi durante l'invio", async () => {
    let resolveFetch: (value: unknown) => void = () => {}
    const fetchMock = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        })
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<Curriculum />)

    await fillRequiredFields(user)
    await user.click(screen.getByRole("button", { name: "Invia candidatura" }))

    expect(screen.getByRole("button", { name: "Invio in corso…" })).toBeDisabled()
    expect(screen.getByLabelText(/^Nome/)).toBeDisabled()

    resolveFetch({ ok: true, status: 200, json: async () => ({ ok: true }) })
    await waitFor(() => {
      expect(screen.getByText("Candidatura ricevuta!")).toBeInTheDocument()
    })
  })

  it("submit: risposta 429 mostra il messaggio di troppi tentativi", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 429 })
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<Curriculum />)

    await fillRequiredFields(user)
    await user.click(screen.getByRole("button", { name: "Invia candidatura" }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Troppi tentativi in poco tempo. Riprova tra qualche minuto o scrivici a info@dedicaresolutions.it."
      )
    })
  })

  it("submit: risposta 413 mostra il messaggio sul limite dei 5MB", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 413 })
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<Curriculum />)

    await fillRequiredFields(user)
    await user.click(screen.getByRole("button", { name: "Invia candidatura" }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Il file supera i 5MB.")
    })
  })

  it("submit: risposta 503 mostra il messaggio di invio non riuscito", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 503 })
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<Curriculum />)

    await fillRequiredFields(user)
    await user.click(screen.getByRole("button", { name: "Invia candidatura" }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Invio non riuscito. Riprova più tardi o invia il CV direttamente a info@dedicaresolutions.it."
      )
    })
  })

  it("submit: errore di rete (fetch che rigetta) mostra il messaggio dedicato", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"))
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<Curriculum />)

    await fillRequiredFields(user)
    await user.click(screen.getByRole("button", { name: "Invia candidatura" }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Errore di rete. Controlla la connessione e riprova."
      )
    })
  })

  it("dopo il successo, 'invia un'altra candidatura' riporta al form vuoto", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) })
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<Curriculum />)

    await fillRequiredFields(user)
    await user.click(screen.getByRole("button", { name: "Invia candidatura" }))
    await waitFor(() => screen.getByText("Candidatura ricevuta!"))

    await user.click(screen.getByRole("button", { name: "Invia un'altra candidatura" }))

    expect(screen.getByRole("button", { name: "Invia candidatura" })).toBeInTheDocument()
    expect((screen.getByLabelText(/^Nome/) as HTMLInputElement).value).toBe("")
    expect(screen.getByRole("button", { name: "Invia candidatura" })).toBeEnabled()
  })

  it("dopo un invio riuscito, i campi e il CV vengono azzerati", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) })
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    const { container } = render(<Curriculum />)

    await fillRequiredFields(user)
    await user.upload(screen.getByLabelText(/Seleziona file/), makePdfFile("cv.pdf"))
    await user.click(screen.getByRole("button", { name: "Invia candidatura" }))
    await waitFor(() => screen.getByText("Candidatura ricevuta!"))

    await user.click(screen.getByRole("button", { name: "Invia un'altra candidatura" }))

    const fileInput = within(container).getByLabelText(/Seleziona file/) as HTMLInputElement
    expect(fileInput.files?.length ?? 0).toBe(0)
    expect(screen.getByText("Nessun file selezionato")).toBeInTheDocument()
  })
})
