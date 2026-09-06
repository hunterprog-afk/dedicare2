import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { render } from "@/test/test-utils"
import { ContactForm } from "@/components/ContactForm"
import { CONTATTO_ENDPOINT, PRIVACY_POLICY_VERSIONE } from "@/lib/formsApi"

// 2026-09: migrazione dal precedente fornitore terzo di modulistica
// all'endpoint pubblico del bot aziendale (CONTRATTO-moduli-sito-m365.md
// §1/§5/§8). Via la checkbox "privacy" —
// sostituita da un link (bottone) che apre il modal Privacy Policy esistente
// via la prop `onOpenPrivacy` (passata da CtaFooter, che possiede
// `openLegal("privacy")`). Aggiunta la validazione client dei campi
// obbligatori e l'honeypot anti-spam `sito_web`.

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Nome/), "Giulia")
  await user.type(screen.getByLabelText(/^Email/), "giulia@example.com")
  await user.type(
    screen.getByLabelText(/^Messaggio/),
    "Vorrei informazioni sull'assistenza domiciliare"
  )
}

describe("ContactForm — form di contatto", () => {
  const onOpenPrivacy = vi.fn()

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
    onOpenPrivacy.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("renders tutti i campi, l'hint sulla salute e il link all'informativa, senza checkbox privacy", () => {
    render(<ContactForm onOpenPrivacy={onOpenPrivacy} />)

    expect(screen.getByLabelText(/^Nome/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Telefono/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Messaggio/)).toBeInTheDocument()
    expect(screen.queryByLabelText(/Acconsento/)).not.toBeInTheDocument()

    expect(
      screen.getByText(/non inserire qui informazioni sullo stato di salute/i)
    ).toBeInTheDocument()

    const link = screen.getByRole("button", { name: "informativa privacy" })
    expect(link).toBeInTheDocument()

    expect(screen.getByRole("button", { name: "Invia messaggio" })).toBeEnabled()
  })

  it("il link dell'informativa privacy chiama onOpenPrivacy (apre il modal, non naviga)", async () => {
    const user = userEvent.setup()
    render(<ContactForm onOpenPrivacy={onOpenPrivacy} />)

    await user.click(screen.getByRole("button", { name: "informativa privacy" }))

    expect(onOpenPrivacy).toHaveBeenCalledTimes(1)
  })

  it("submit: senza i campi obbligatori mostra l'errore di validazione e non chiama fetch", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<ContactForm onOpenPrivacy={onOpenPrivacy} />)

    await user.click(screen.getByRole("button", { name: "Invia messaggio" }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Compila i campi obbligatori (nome, email valida e messaggio)."
      )
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("submit: invia il JSON atteso a /public/contatto (incluso honeypot vuoto, lingua e informativa_versione) e mostra la schermata di successo", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) })
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<ContactForm onOpenPrivacy={onOpenPrivacy} />)

    await fillRequiredFields(user)
    await user.type(screen.getByLabelText(/^Telefono/), "3331234567")
    await user.click(screen.getByRole("button", { name: "Invia messaggio" }))

    await waitFor(() => {
      expect(screen.getByText("Messaggio inviato!")).toBeInTheDocument()
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(CONTATTO_ENDPOINT)
    expect(init.method).toBe("POST")
    expect(init.headers).toMatchObject({
      "Content-Type": "application/json",
      Accept: "application/json",
    })

    const body = JSON.parse(init.body as string)
    expect(body).toMatchObject({
      nome: "Giulia",
      telefono: "3331234567",
      email: "giulia@example.com",
      messaggio: "Vorrei informazioni sull'assistenza domiciliare",
      sito_web: "",
      lingua: "it",
      informativa_versione: PRIVACY_POLICY_VERSIONE,
    })
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
    render(<ContactForm onOpenPrivacy={onOpenPrivacy} />)

    await fillRequiredFields(user)
    await user.click(screen.getByRole("button", { name: "Invia messaggio" }))

    expect(screen.getByLabelText(/^Nome/)).toBeDisabled()

    resolveFetch({ ok: true, status: 200, json: async () => ({ ok: true }) })
    await waitFor(() => {
      expect(screen.getByText("Messaggio inviato!")).toBeInTheDocument()
    })
  })

  it("submit: risposta 429 mostra il messaggio di troppi tentativi", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 429 })
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<ContactForm onOpenPrivacy={onOpenPrivacy} />)

    await fillRequiredFields(user)
    await user.click(screen.getByRole("button", { name: "Invia messaggio" }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Troppi tentativi in poco tempo. Riprova tra qualche minuto o chiamaci al +39 388 253 6992."
      )
    })
  })

  it("submit: risposta 503 mostra il messaggio di invio fallito", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 503 })
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<ContactForm onOpenPrivacy={onOpenPrivacy} />)

    await fillRequiredFields(user)
    await user.click(screen.getByRole("button", { name: "Invia messaggio" }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Invio fallito. Riprova o contattaci direttamente."
      )
    })
  })

  it("submit: errore di rete (fetch che rigetta) mostra il messaggio dedicato", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"))
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<ContactForm onOpenPrivacy={onOpenPrivacy} />)

    await fillRequiredFields(user)
    await user.click(screen.getByRole("button", { name: "Invia messaggio" }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Errore di rete. Controlla la connessione e riprova."
      )
    })
  })

  it("dopo il successo, 'invia un altro messaggio' riporta al form vuoto", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) })
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<ContactForm onOpenPrivacy={onOpenPrivacy} />)

    await fillRequiredFields(user)
    await user.click(screen.getByRole("button", { name: "Invia messaggio" }))
    await waitFor(() => screen.getByText("Messaggio inviato!"))

    await user.click(screen.getByRole("button", { name: "Invia un altro messaggio" }))

    expect(screen.getByRole("button", { name: "Invia messaggio" })).toBeInTheDocument()
    expect((screen.getByLabelText(/^Nome/) as HTMLInputElement).value).toBe("")
  })
})
