import type { ReactElement } from "react"
import { I18nextProvider } from "react-i18next"
import { render } from "@testing-library/react"
import { createI18n } from "@/i18n"
import type { Lang } from "@/routes"

export function renderWithI18n(ui: ReactElement, lang: Lang = "it") {
  const i18n = createI18n(lang)
  return { i18n, ...render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>) }
}

export * from "@testing-library/react"
