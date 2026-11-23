import { Children, Fragment, cloneElement, createContext, createElement, isValidElement, useContext, type ReactElement, type ReactNode } from "react"
import type { Lang } from "@/routes"

type Options = { returnObjects?: boolean; [variable: string]: string | number | boolean | undefined }

/** Funzione di traduzione: chiave a percorso puntato, `{{variabile}}` nelle stringhe, `returnObjects` per gli elenchi. */
export interface TFunction {
  (key: string, options: Options & { returnObjects: true }): any // eslint-disable-line @typescript-eslint/no-explicit-any
  (key: string, options?: Options): string
}

/** Dizionario di una lingua, creato una volta per render. */
export interface I18n {
  language: Lang
  t: TFunction
}

export type LocaleResources = Partial<Record<Lang, { translation: object }>>

/** In produzione sul browser una chiave mancante mostra la chiave; nei test e nel pre-render fa fallire. */
const STRICT = !(import.meta.env.PROD && !import.meta.env.SSR)

function lookup(dict: object, key: string): unknown {
  let node: unknown = dict
  for (const part of key.split(".")) {
    if (node === null || typeof node !== "object") return undefined
    node = (node as Record<string, unknown>)[part]
  }
  return node
}

export function createI18n(lang: Lang, resources: LocaleResources): I18n {
  const dict = resources[lang]?.translation ?? {}
  const t = ((key: string, options?: Options) => {
    const value = lookup(dict, key)
    if (value === undefined) {
      if (STRICT) throw new Error(`Chiave di testo mancante: ${lang}:${key}`)
      return key
    }
    if (typeof value !== "string") return value
    return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name: string) => String(options?.[name] ?? ""))
  }) as TFunction
  return { language: lang, t }
}

const I18nContext = createContext<I18n | null>(null)

export function I18nextProvider({ i18n, children }: { i18n: I18n; children: ReactNode }) {
  return createElement(I18nContext.Provider, { value: i18n }, children)
}

export function useTranslation(): { t: TFunction; i18n: I18n } {
  const i18n = useContext(I18nContext)
  if (!i18n) throw new Error("useTranslation fuori da I18nextProvider")
  return { t: i18n.t, i18n }
}

/** Testo con tag semplici: `<nome>testo</nome>` diventa l'elemento passato in `components` con quel testo dentro. */
export function Trans({ i18nKey, components }: { i18nKey: string; components: Record<string, ReactElement> }) {
  const { t } = useTranslation()
  const parts = t(i18nKey).split(/(<\w+>.*?<\/\w+>)/g)
  return createElement(
    Fragment,
    null,
    ...parts.map((part, i) => {
      const m = /^<(\w+)>(.*)<\/\1>$/.exec(part)
      const el = m ? components[m[1]] : undefined
      if (!m || !isValidElement(el)) return part
      return cloneElement(el, { key: i }, ...Children.toArray(m[2]))
    }),
  )
}
