import { describe, expect, it } from "vitest"
import itJson from "./locales/it.json"
import enJson from "./locales/en.json"
import { createI18n } from "./index"

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
    expect(createI18n("it").t("hero.h1_a")).toBe("Assistenza a casa,")
    expect(createI18n("en").t("hero.h1_a")).toBe("Home care,")
    expect(createI18n("en").t("servizi.items", { returnObjects: true })).toHaveProperty("oss")
  })
})
