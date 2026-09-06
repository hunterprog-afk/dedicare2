import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { render } from "@/test/test-utils"
import { ContactForm } from "@/components/ContactForm"
import { CONTATTO_ENDPOINT, PRIVACY_POLICY_VERSIONE } from "@/lib/formsApi"
import i18n from "@/i18n"

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

  afterEach(async () => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    // Vedi Curriculum.test.tsx: alcuni test cambiano la lingua attiva,
    // ripristiniamo sempre "it" per non lasciare stato tra i test.
    await i18n.changeLanguage("it")
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

  it("honeypot: nascosto, fuori dal tab order, ignorato dai password manager e inviato vuoto", () => {
    const { container } = render(<ContactForm onOpenPrivacy={onOpenPrivacy} />)
    const honeypot = container.querySelector('input[name="sito_web"]') as HTMLInputElement

    expect(honeypot).toBeInTheDocument()
    expect(honeypot).toHaveAttribute("aria-hidden", "true")
    expect(honeypot).toHaveAttribute("tabindex", "-1")
    // Vedi Curriculum.test.tsx: i password manager compilano per euristica
    // sul `name` (ignorano autoComplete="off"), quindi un utente reale con
    // "sito_web" precompilato verrebbe scartato in silenzio dal bot.
    expect(honeypot).toHaveAttribute("data-1p-ignore", "true")
    expect(honeypot).toHaveAttribute("data-lpignore", "true")
    expect(honeypot).toHaveAttribute("data-bwignore", "true")
    expect(honeypot.value).toBe("")

    // 4 campi testuali visibili attesi: nome, telefono, email, messaggio.
    // Se l'honeypot perdesse aria-hidden comparirebbe come quinto elemento.
    expect(screen.getAllByRole("textbox")).toHaveLength(4)
    expect(screen.getAllByRole("textbox")).not.toContain(honeypot)
  })

  it("i campi obbligatori hanno i maxLength lato client coerenti col contratto API (§1)", () => {
    render(<ContactForm onOpenPrivacy={onOpenPrivacy} />)
    expect(screen.getByLabelText(/^Nome/)).toHaveAttribute("maxlength", "100")
    expect(screen.getByLabelText(/^Telefono/)).toHaveAttribute("maxlength", "40")
    expect(screen.getByLabelText(/^Email/)).toHaveAttribute("maxlength", "254")
    expect(screen.getByLabelText(/^Messaggio/)).toHaveAttribute("maxlength", "5000")
  })

  it("il link dell'informativa privacy chiama onOpenPrivacy (apre il modal, non naviga) e non invia nulla", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<ContactForm onOpenPrivacy={onOpenPrivacy} />)

    await user.click(screen.getByRole("button", { name: "informativa privacy" }))

    expect(onOpenPrivacy).toHaveBeenCalledTimes(1)
    expect(fetchMock).not.toHaveBeenCalled()
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

  it("submit: email malformata (mario@) mostra l'errore di validazione e non chiama fetch", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<ContactForm onOpenPrivacy={onOpenPrivacy} />)

    await user.type(screen.getByLabelText(/^Nome/), "Giulia")
    await user.type(screen.getByLabelText(/^Email/), "mario@")
    await user.type(screen.getByLabelText(/^Messaggio/), "Vorrei informazioni")
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

  it("submit: quando la lingua attiva è l'inglese invia lingua='en' (ripristinata a 'it' in afterEach)", async () => {
    await i18n.changeLanguage("en")
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) })
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<ContactForm onOpenPrivacy={onOpenPrivacy} />)

    await user.type(screen.getByLabelText(/^Name/), "Giulia")
    await user.type(screen.getByLabelText(/^Email/), "giulia@example.com")
    await user.type(screen.getByLabelText(/^Message/), "I need information")
    await user.click(screen.getByRole("button", { name: "Send message" }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(body.lingua).toBe("en")
  })

  it("submit: un doppio click con fetch lenta genera una sola chiamata (il bottone si disabilita subito)", async () => {
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
    // L'icona di spinner è aria-hidden, quindi il nome accessibile del
    // bottone durante il caricamento resta il solo testo "Invio in corso…"
    // (stesso pattern di Curriculum.test.tsx). Il bottone è già disabilitato
    // quando arriva questo secondo click: un bottone HTML disabled non
    // emette eventi click, né nel browser né in jsdom.
    await user.click(screen.getByRole("button", { name: "Invio in corso…" }))

    expect(fetchMock).toHaveBeenCalledTimes(1)

    resolveFetch({ ok: true, status: 200, json: async () => ({ ok: true }) })
    await waitFor(() => {
      expect(screen.getByText("Messaggio inviato!")).toBeInTheDocument()
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
