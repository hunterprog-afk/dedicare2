import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import userEvent from "@testing-library/user-event"
import { act, renderWithI18n, screen, waitFor } from "@/test/test-utils"
import { ContactForm } from "./ContactForm"
import itJson from "@/i18n/locales/it.json"

const MODES = [
  { name: "formspree", env: "", url: "https://formspree.io/f/mkoybjyb", hp: "_gotcha" },
  { name: "m365", env: "http://localhost:3000/", url: "http://localhost:3000/public/contatto", hp: "sito_web" },
] as const

const c = itJson.contactform

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Nome/), "  Mario Rossi ")
  await user.type(screen.getByLabelText(/^Email/), "mario@esempio.it")
  await user.type(screen.getByLabelText(/^Messaggio/), "Serve assistenza")
}

describe.each(MODES)("ContactForm ($name)", (mode) => {
  let fetchMock: ReturnType<typeof vi.fn>
  beforeEach(() => {
    vi.stubEnv("VITE_FORMS_API_BASE", mode.env)
    fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal("fetch", fetchMock)
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it("campi, aiuto, informativa e nessuna checkbox", () => {
    const { container } = renderWithI18n(<ContactForm />)
    expect(screen.getByLabelText(/^Nome/)).toHaveAttribute("maxlength", "100")
    expect(screen.getByLabelText(/^Telefono/)).toHaveAttribute("type", "tel")
    expect(screen.getByLabelText(/^Email/)).toHaveAttribute("type", "email")
    expect(screen.getByLabelText(/^Messaggio/)).toHaveAttribute("maxlength", "5000")
    expect(screen.getByText(c.hint_salute)).toBeInTheDocument()
    const link = screen.getByRole("link", { name: "informativa privacy" })
    expect(link).toHaveAttribute("href", "/privacy/")
    expect(link).toHaveAttribute("target", "_blank")
    expect(container.querySelector('input[type="checkbox"]')).toBeNull()
    expect(container.querySelector(`input[name="${mode.hp}"]`)).toBeInTheDocument()
  })

  it("invio vuoto: avviso, nessuna fetch, fuoco sul Nome", async () => {
    const user = userEvent.setup()
    renderWithI18n(<ContactForm />)
    await user.click(screen.getByRole("button", { name: c.submit }))
    expect(screen.getByRole("alert")).toHaveTextContent(c.error_required)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByLabelText(/^Nome/)).toHaveFocus()
  })

  it("email sbagliata: errore all'uscita dal campo, sparisce quando è corretta", async () => {
    const user = userEvent.setup()
    renderWithI18n(<ContactForm />)
    const email = screen.getByLabelText(/^Email/)
    await user.type(email, "non-valida")
    expect(screen.queryByText(itJson.form.field_email)).toBeNull()
    await user.tab()
    expect(screen.getByText(itJson.form.field_email)).toBeInTheDocument()
    expect(email).toHaveAttribute("aria-invalid", "true")
    await user.type(email, "@esempio.it")
    expect(screen.queryByText(itJson.form.field_email)).toBeNull()
  })

  it("invio valido: una fetch con il corpo atteso, poi successo e campi vuoti", async () => {
    const user = userEvent.setup()
    renderWithI18n(<ContactForm />)
    await fill(user)
    await user.click(screen.getByRole("button", { name: c.submit }))
    await waitFor(() => expect(screen.getByText(c.success_title)).toBeInTheDocument())
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(mode.url)
    expect(init.method).toBe("POST")
    expect(init.headers).toMatchObject({ "Content-Type": "application/json", Accept: "application/json" })
    expect(JSON.parse(init.body)).toEqual({
      nome: "Mario Rossi",
      telefono: "",
      email: "mario@esempio.it",
      messaggio: "Serve assistenza",
      [mode.hp]: "",
      lingua: "it",
      informativa_versione: "privacy-policy-2026-10",
    })
    await user.click(screen.getByRole("button", { name: c.success_retry }))
    expect(screen.getByLabelText(/^Nome/)).toHaveValue("")
    expect(screen.getByLabelText(/^Messaggio/)).toHaveValue("")
  })

  it("dalla pagina inglese la lingua inviata è en", async () => {
    const user = userEvent.setup()
    renderWithI18n(<ContactForm />, "en")
    await user.type(screen.getByLabelText(/^Name/), "Jane")
    await user.type(screen.getByLabelText(/^Email/), "jane@example.com")
    await user.type(screen.getByLabelText(/^Message/), "Hello")
    await user.click(screen.getByRole("button", { name: /send message/i }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).lingua).toBe("en")
  })

  it("429 → messaggio del limite di richieste", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 429 })
    const user = userEvent.setup()
    renderWithI18n(<ContactForm />)
    await fill(user)
    await user.click(screen.getByRole("button", { name: c.submit }))
    expect(await screen.findByRole("alert")).toHaveTextContent(c.error_rate_limit)
  })

  it("503 → error_send; 400 → error_required", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503 })
    const user = userEvent.setup()
    renderWithI18n(<ContactForm />)
    await fill(user)
    await user.click(screen.getByRole("button", { name: c.submit }))
    expect(await screen.findByRole("alert")).toHaveTextContent(c.error_send)
    fetchMock.mockResolvedValue({ ok: false, status: 400 })
    await user.click(screen.getByRole("button", { name: c.submit }))
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(c.error_required))
  })

  it("fetch che lancia → error_network e i dati restano", async () => {
    fetchMock.mockRejectedValue(new TypeError("offline"))
    const user = userEvent.setup()
    renderWithI18n(<ContactForm />)
    await fill(user)
    await user.click(screen.getByRole("button", { name: c.submit }))
    expect(await screen.findByRole("alert")).toHaveTextContent(c.error_network)
    expect(screen.getByLabelText(/^Nome/)).toHaveValue("  Mario Rossi ")
  })

  it("doppio clic: una sola fetch, bottone disabilitato durante l'invio", async () => {
    let resolve!: (v: unknown) => void
    fetchMock.mockReturnValue(new Promise((r) => (resolve = r)))
    const user = userEvent.setup()
    renderWithI18n(<ContactForm />)
    await fill(user)
    await user.dblClick(screen.getByRole("button", { name: c.submit }))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("button", { name: c.submitting })).toBeDisabled()
    await act(async () => resolve({ ok: true, status: 200 }))
    expect(await screen.findByText(c.success_title)).toBeInTheDocument()
  })

  it("l'evento di precompilazione riempie il messaggio solo se vuoto e porta il fuoco sul Nome", async () => {
    const user = userEvent.setup()
    renderWithI18n(<ContactForm />)
    act(() => {
      window.dispatchEvent(new CustomEvent("dedicare:prefill", { detail: "Vorrei un preventivo" }))
    })
    expect(screen.getByLabelText(/^Messaggio/)).toHaveValue("Vorrei un preventivo")
    expect(screen.getByLabelText(/^Nome/)).toHaveFocus()
    await user.clear(screen.getByLabelText(/^Messaggio/))
    await user.type(screen.getByLabelText(/^Messaggio/), "Mio testo")
    act(() => {
      window.dispatchEvent(new CustomEvent("dedicare:prefill", { detail: "Vorrei un preventivo" }))
    })
    expect(screen.getByLabelText(/^Messaggio/)).toHaveValue("Mio testo")
  })
})
