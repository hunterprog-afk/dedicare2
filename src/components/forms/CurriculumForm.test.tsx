import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import userEvent from "@testing-library/user-event"
import { renderWithI18n, screen, waitFor } from "@/test/test-utils"
import { CurriculumForm } from "./CurriculumForm"
import itJson from "@/i18n/locales/it.json"

const MODES = [
  { name: "formspree", env: "", url: "https://formspree.io/f/mkoybjyb", hp: "_gotcha" },
  { name: "m365", env: "http://localhost:3000", url: "http://localhost:3000/public/candidatura", hp: "sito_web" },
] as const

const c = itJson.curriculum

function pdf(name = "cv.pdf", size = 1000, type = "application/pdf") {
  const f = new File(["%PDF"], name, { type })
  Object.defineProperty(f, "size", { value: size })
  return f
}

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Nome/), "Anna")
  await user.type(screen.getByLabelText(/^Cognome/), "Bianchi")
  await user.type(screen.getByLabelText(/^Email/), "anna@esempio.it")
  await user.selectOptions(screen.getByLabelText(/^Posizione/), "Infermiere")
}

describe.each(MODES)("CurriculumForm ($name)", (mode) => {
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

  it("informativa, aiuto CV, posizioni, nessuna checkbox", () => {
    const { container } = renderWithI18n(<CurriculumForm />)
    const link = screen.getByRole("link", { name: "informativa privacy per i candidati" })
    expect(link).toHaveAttribute("href", "/informativa-candidati.html")
    expect(link).toHaveAttribute("target", "_blank")
    expect(screen.getByText(c.hint_cv)).toBeInTheDocument()
    expect(container.querySelector('input[type="checkbox"]')).toBeNull()
    expect(screen.getByRole("option", { name: "Assistente familiare" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: /badante/i })).toBeNull()
    expect(screen.getByRole("option", { name: c.posizione_placeholder })).toBeDisabled()
  })

  it("in inglese l'etichetta è «Family care assistant» ma il valore resta italiano", () => {
    renderWithI18n(<CurriculumForm />, "en")
    const opt = screen.getByRole("option", { name: "Family care assistant" }) as HTMLOptionElement
    expect(opt.value).toBe("Assistente familiare")
    expect(screen.queryByRole("option", { name: /badante/i })).toBeNull()
  })

  it("obbligatori vuoti → error_required, nessuna fetch", async () => {
    const user = userEvent.setup()
    renderWithI18n(<CurriculumForm />)
    await user.click(screen.getByRole("button", { name: c.submit }))
    expect(screen.getByRole("alert")).toHaveTextContent(c.error_required)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByLabelText(/^Nome/)).toHaveFocus()
  })

  it("PDF da 6 MB → error_filesize; .png → error_filetype; poi un PDF valido", async () => {
    const user = userEvent.setup({ applyAccept: false })
    const { container } = renderWithI18n(<CurriculumForm />)
    const input = container.querySelector<HTMLInputElement>("#cv")!
    await user.upload(input, pdf("grande.pdf", 6 * 1024 * 1024))
    expect(screen.getByRole("alert")).toHaveTextContent(c.error_filesize)
    expect(screen.getByText(c.cv_none)).toBeInTheDocument()
    await user.upload(input, pdf("foto.png", 100, "image/png"))
    expect(screen.getByRole("alert")).toHaveTextContent(c.error_filetype)
    await user.upload(input, pdf("ok.pdf"))
    expect(screen.queryByRole("alert")).toBeNull()
    expect(screen.getByText("ok.pdf")).toBeInTheDocument()
  })

  it("invio valido: FormData completo e successo", async () => {
    const user = userEvent.setup()
    const { container } = renderWithI18n(<CurriculumForm />)
    await fill(user)
    await user.type(screen.getByLabelText(/^Telefono/), "333 000 0000")
    await user.type(screen.getByLabelText(/^Messaggio/), "Disponibile la sera")
    await user.upload(container.querySelector<HTMLInputElement>("#cv")!, pdf("mio.pdf"))
    await user.click(screen.getByRole("button", { name: c.submit }))
    await waitFor(() => expect(screen.getByText(c.success_title)).toBeInTheDocument())
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(mode.url)
    expect(init.headers).toEqual({ Accept: "application/json" })
    const fd = init.body as FormData
    expect(fd.get("nome")).toBe("Anna")
    expect(fd.get("cognome")).toBe("Bianchi")
    expect(fd.get("email")).toBe("anna@esempio.it")
    expect(fd.get("telefono")).toBe("333 000 0000")
    expect(fd.get("posizione")).toBe("Infermiere")
    expect(fd.get("messaggio")).toBe("Disponibile la sera")
    expect((fd.get("cv") as File).name).toBe("mio.pdf")
    expect(fd.get("lingua")).toBe("it")
    expect(fd.get("informativa_versione")).toBe("candidati-v1.1-2026-10")
    expect(fd.get(mode.hp)).toBe("")
    expect(fd.get("_subject")).toBe(mode.name === "formspree" ? "Candidatura — Lavora con noi" : null)
  })

  it("dalla pagina inglese la posizione inviata è l'etichetta italiana", async () => {
    const user = userEvent.setup()
    renderWithI18n(<CurriculumForm />, "en")
    await user.type(screen.getByLabelText(/^First name/), "Anna")
    await user.type(screen.getByLabelText(/^Last name/), "Bianchi")
    await user.type(screen.getByLabelText(/^Email/), "anna@example.com")
    await user.selectOptions(screen.getByLabelText(/^Position/), "Nurse")
    await user.click(screen.getByRole("button", { name: "Send application" }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const fd = fetchMock.mock.calls[0][1].body as FormData
    expect(fd.get("posizione")).toBe("Infermiere")
    expect(fd.get("lingua")).toBe("en")
  })

  it.each([
    [413, c.error_filesize],
    [415, c.error_filetype],
    [429, c.error_rate_limit],
    [503, c.error_send],
    [400, c.error_required],
  ])("risposta %i → messaggio atteso", async (status, text) => {
    fetchMock.mockResolvedValue({ ok: false, status })
    const user = userEvent.setup()
    renderWithI18n(<CurriculumForm />)
    await fill(user)
    await user.click(screen.getByRole("button", { name: c.submit }))
    const alerts = await screen.findAllByRole("alert")
    expect(alerts.map((a) => a.textContent).join(" ")).toContain(text)
  })

  it("rete → error_network; i dati restano", async () => {
    fetchMock.mockRejectedValue(new TypeError("offline"))
    const user = userEvent.setup()
    renderWithI18n(<CurriculumForm />)
    await fill(user)
    await user.click(screen.getByRole("button", { name: c.submit }))
    expect(await screen.findByRole("alert")).toHaveTextContent(c.error_network)
    expect(screen.getByLabelText(/^Nome/)).toHaveValue("Anna")
  })

  it("doppio clic: una sola fetch", async () => {
    fetchMock.mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()
    renderWithI18n(<CurriculumForm />)
    await fill(user)
    await user.dblClick(screen.getByRole("button", { name: c.submit }))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
