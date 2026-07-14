import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { render } from "@/test/test-utils"
import { Curriculum } from "@/components/Curriculum"

// Caratterizza il comportamento ATTUALE del form di candidatura prima dello
// split in sotto-componenti (00 - vedi 06 - Prossimi passi / DECISION-NEEDED
// no-giant-component). Il refactor deve lasciare questi test verdi senza
// modifiche: se un test qui cambia, è un cambio di comportamento, non solo
// di struttura.

const FORMSPREE_URL = "https://formspree.io/f/mkoybjyb"

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
  await user.click(screen.getByLabelText(/Acconsento al trattamento/))
}

describe("Curriculum — form di candidatura", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("renders tutti i campi del form con le label corrette", () => {
    render(<Curriculum />)
    expect(screen.getByLabelText(/^Nome/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Cognome/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Telefono/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Posizione/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Messaggio/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Acconsento al trattamento/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Invia candidatura" })).toBeInTheDocument()
  })

  it("disabilita il bottone di invio finché la privacy non è accettata", async () => {
    const user = userEvent.setup()
    render(<Curriculum />)

    const submit = screen.getByRole("button", { name: "Invia candidatura" })
    expect(submit).toBeDisabled()

    await user.type(screen.getByLabelText(/^Nome/), "Maria")
    expect(submit).toBeDisabled()

    await user.click(screen.getByLabelText(/Acconsento al trattamento/))
    expect(submit).toBeEnabled()

    await user.click(screen.getByLabelText(/Acconsento al trattamento/))
    expect(submit).toBeDisabled()
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

  it("upload: rifiuta un file non-PDF, resetta l'input e torna a 'nessun file'", async () => {
    const user = userEvent.setup()
    render(<Curriculum />)

    const file = new File(["x"], "curriculum.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })
    const input = screen.getByLabelText(/Seleziona file/) as HTMLInputElement
    await user.upload(input, file)

    // NOTA (bug pre-esistente, non introdotto da questo refactor — vedi
    // Curriculum.tsx `handleFile`): l'errore viene calcolato in
    // `errorMsg` ma il paragrafo role="alert" si mostra solo quando
    // `status === "error"`, che `handleFile` non imposta mai. Il messaggio
    // "Formato non supportato" NON è quindi visibile all'utente oggi — qui
    // caratterizziamo il comportamento reale, non quello atteso.
    expect(input.value).toBe("")
    expect(screen.getByText("Nessun file selezionato")).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("upload: rifiuta un PDF oltre i 5MB e resetta l'input (stesso bug di visibilità del messaggio)", async () => {
    const user = userEvent.setup()
    render(<Curriculum />)

    const file = makePdfFile("grosso.pdf", 5 * 1024 * 1024 + 1)
    const input = screen.getByLabelText(/Seleziona file/) as HTMLInputElement
    await user.upload(input, file)

    expect(input.value).toBe("")
    expect(screen.getByText("Nessun file selezionato")).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("upload: selezionare un file valido dopo un errore lo accetta comunque", async () => {
    const user = userEvent.setup()
    render(<Curriculum />)

    const input = screen.getByLabelText(/Seleziona file/) as HTMLInputElement
    await user.upload(input, new File(["x"], "bad.txt", { type: "text/plain" }))
    expect(screen.getByText("Nessun file selezionato")).toBeInTheDocument()

    await user.upload(input, makePdfFile("ok.pdf"))
    expect(screen.getByText("ok.pdf")).toBeInTheDocument()
  })

  it("submit: invia i campi attesi (incluso il file) a Formspree e mostra la schermata di successo", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
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
    expect(url).toBe(FORMSPREE_URL)
    expect(init.method).toBe("POST")
    expect(init.headers).toMatchObject({ Accept: "application/json" })

    const body = init.body as FormData
    expect(body.get("nome")).toBe("Maria")
    expect(body.get("cognome")).toBe("Rossi")
    expect(body.get("email")).toBe("maria.rossi@example.com")
    expect(body.get("telefono")).toBe("3331234567")
    expect(body.get("posizione")).toBe("Operatore Socio Sanitario (OSS)")
    expect(body.get("messaggio")).toBe("Disponibile da subito")
    expect(body.get("_subject")).toBe("Candidatura — Lavora con noi")
    const cvEntry = body.get("cv") as File
    expect(cvEntry.name).toBe("cv.pdf")
  })

  it("submit: senza CV allegato non include il campo cv nel FormData", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
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

    resolveFetch({ ok: true, json: async () => ({}) })
    await waitFor(() => {
      expect(screen.getByText("Candidatura ricevuta!")).toBeInTheDocument()
    })
  })

  it("submit: risposta non-ok mostra l'errore restituito dal server", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Email non valida secondo Formspree" }),
    })
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<Curriculum />)

    await fillRequiredFields(user)
    await user.click(screen.getByRole("button", { name: "Invia candidatura" }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Email non valida secondo Formspree")
    })
    expect(screen.getByRole("button", { name: "Invia candidatura" })).toBeInTheDocument()
  })

  it("submit: risposta non-ok senza body di errore usa il messaggio di fallback", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error("no json")
      },
    })
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<Curriculum />)

    await fillRequiredFields(user)
    await user.click(screen.getByRole("button", { name: "Invia candidatura" }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Invio fallito. Riprova o scrivici a info@dedicaresolutions.it."
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
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<Curriculum />)

    await fillRequiredFields(user)
    await user.click(screen.getByRole("button", { name: "Invia candidatura" }))
    await waitFor(() => screen.getByText("Candidatura ricevuta!"))

    await user.click(screen.getByRole("button", { name: "Invia un'altra candidatura" }))

    expect(screen.getByRole("button", { name: "Invia candidatura" })).toBeInTheDocument()
    expect((screen.getByLabelText(/^Nome/) as HTMLInputElement).value).toBe("")
    expect(screen.getByRole("button", { name: "Invia candidatura" })).toBeDisabled()
  })

  it("dopo un invio riuscito, i campi e il CV vengono azzerati", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
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
