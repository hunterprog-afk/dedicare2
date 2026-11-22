import { createElement } from "react"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import itJson from "./locales/it.json"
import enJson from "./locales/en.json"
import { createI18n } from "./index"
import { I18nextProvider, Trans } from "./react"

type Json = string | number | boolean | null | Json[] | { [k: string]: Json }

/** Elenco ricorsivo dei percorsi di ogni foglia; gli array contano per posizione. */
function paths(value: Json, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return [`${prefix}[${value.length}]`, ...value.flatMap((v, i) => paths(v, `${prefix}[${i}]`))]
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => paths(v, prefix ? `${prefix}.${k}` : k))
  }
  return [prefix]
}

function leaves(value: Json, prefix = ""): [string, Json][] {
  if (Array.isArray(value)) return value.flatMap((v, i) => leaves(v, `${prefix}[${i}]`))
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k))
  }
  return [[prefix, value]]
}

describe("testi IT/EN", () => {
  it("le due lingue hanno lo stesso insieme di chiavi", () => {
    expect(paths(enJson as Json).sort()).toEqual(paths(itJson as Json).sort())
  })

  it("nessun valore vuoto, tranne footer.in_italian in italiano", () => {
    for (const [name, json] of [
      ["it", itJson],
      ["en", enJson],
    ] as const) {
      for (const [path, v] of leaves(json as Json)) {
        if (name === "it" && path === "footer.in_italian") continue
        expect(v, `${name}:${path}`).not.toBe("")
      }
    }
  })

  it("createI18n risolve le chiavi in modo sincrono, senza detector", () => {
    expect(createI18n("it").t("mobilebar.call")).toBe("Chiama")
    expect(createI18n("en").t("mobilebar.call")).toBe("Call")
    expect(createI18n("en").t("servizi.items", { returnObjects: true })).toHaveProperty("oss")
  })

  it("sostituisce {{variabile}} e conserva i testi senza variabili", () => {
    const { t } = createI18n("it")
    expect(t("form.field_too_long", { max: 100 })).toBe("Il testo è troppo lungo: al massimo 100 caratteri.")
    expect(t("mobilebar.call", { max: 1 })).toBe("Chiama")
  })

  it("una chiave mancante fa fallire, nei test e nel pre-render", () => {
    expect(() => createI18n("it").t("non.esiste")).toThrow(/non\.esiste/)
  })

  it("Trans mette l'elemento al posto del tag, in entrambe le lingue", () => {
    for (const [lang, text] of [
      ["it", "informativa privacy"],
      ["en", "Privacy Policy"],
    ] as const) {
      const { container } = render(
        createElement(I18nextProvider, {
          i18n: createI18n(lang),
          children: createElement(Trans, { i18nKey: "contactform.informativa", components: { privacyLink: createElement("a", { href: "/privacy/" }) } }),
        }),
      )
      const link = container.querySelector("a")
      expect(link).toHaveAttribute("href", "/privacy/")
      expect(link?.textContent).toBe(text)
      expect(container.textContent).not.toMatch(/[<>]/)
    }
  })
})
