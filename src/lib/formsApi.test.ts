import { describe, expect, it } from "vitest"
import itJson from "@/i18n/locales/it.json"
import { FORMSPREE_ENDPOINT, POSIZIONI_INVIATE, getFormsMode, isEmailValida, mapCandidaturaErrorKey, mapContattoErrorKey } from "./formsApi"
import { checkCv, validateValue } from "./validation"

describe("getFormsMode", () => {
  it("senza base → Formspree con l'endpoint esatto", () => {
    expect(getFormsMode({})).toEqual({ kind: "formspree", contatto: "https://formspree.io/f/mkoybjyb", candidatura: FORMSPREE_ENDPOINT, honeypot: "_gotcha" })
  })
  it("base vuota o di soli spazi → Formspree", () => {
    expect(getFormsMode({ VITE_FORMS_API_BASE: "   " }).kind).toBe("formspree")
  })
  it("con base → M365, barra finale tolta", () => {
    expect(getFormsMode({ VITE_FORMS_API_BASE: "http://localhost:3000/" })).toEqual({
      kind: "m365",
      contatto: "http://localhost:3000/public/contatto",
      candidatura: "http://localhost:3000/public/candidatura",
      honeypot: "sito_web",
    })
  })
})

describe("posizioni inviate", () => {
  it("coincidono con le etichette italiane del JSON", () => {
    expect(POSIZIONI_INVIATE).toEqual(itJson.curriculum.posizioni)
  })
})

describe("mappe degli errori", () => {
  it("candidatura", () => {
    expect(mapCandidaturaErrorKey(400)).toBe("error_required")
    expect(mapCandidaturaErrorKey(422)).toBe("error_required")
    expect(mapCandidaturaErrorKey(413)).toBe("error_filesize")
    expect(mapCandidaturaErrorKey(415)).toBe("error_filetype")
    expect(mapCandidaturaErrorKey(429)).toBe("error_rate_limit")
    for (const s of [500, 502, 503]) expect(mapCandidaturaErrorKey(s)).toBe("error_send")
  })
  it("contatto", () => {
    expect(mapContattoErrorKey(400)).toBe("error_required")
    expect(mapContattoErrorKey(422)).toBe("error_required")
    expect(mapContattoErrorKey(429)).toBe("error_rate_limit")
    for (const s of [413, 415, 500, 502, 503]) expect(mapContattoErrorKey(s)).toBe("error_send")
  })
})

describe("validazione", () => {
  it("isEmailValida", () => {
    expect(isEmailValida("a@b.it")).toBe(true)
    expect(isEmailValida("  a@b.it  ")).toBe(true)
    for (const bad of ["", "a", "a@b", "a b@c.it", "@b.it"]) expect(isEmailValida(bad)).toBe(false)
  })
  it("validateValue", () => {
    expect(validateValue("  ", { required: true, max: 5 })).toBe("required")
    expect(validateValue("x", { email: true, max: 50 })).toBe("email")
    expect(validateValue("", { email: true, max: 50 })).toBeNull()
    expect(validateValue("123456", { max: 5 })).toBe("too_long")
  })
  it("checkCv", () => {
    const pdf = (name: string, size: number, type = "application/pdf") => {
      const f = new File(["x"], name, { type })
      Object.defineProperty(f, "size", { value: size })
      return f
    }
    expect(checkCv(pdf("cv.PDF", 1000))).toBe("ok")
    expect(checkCv(pdf("cv.pdf", 5 * 1024 * 1024))).toBe("ok")
    expect(checkCv(pdf("cv.pdf", 5 * 1024 * 1024 + 1))).toBe("error_filesize")
    expect(checkCv(pdf("cv.png", 10, "image/png"))).toBe("error_filetype")
    expect(checkCv(pdf("cv.png", 10))).toBe("error_filetype")
  })
})
