import { createI18n as create, type I18n, type LocaleResources } from "./react"
import type { Lang } from "@/routes"

export type { LocaleResources }

/** Istanza sincrona, una per render: nessun detector, nessun localStorage. Le risorse arrivano da fuori. */
export function initI18n(lang: Lang, resources: LocaleResources): I18n {
  return create(lang, resources)
}
