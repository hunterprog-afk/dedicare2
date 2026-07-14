import type { ReactElement } from "react"
import { render, type RenderOptions } from "@testing-library/react"
import { LazyMotion, domAnimation } from "motion/react"

// Wrapper condiviso per i test component: replica il provider LazyMotion
// montato in App.tsx (App.tsx:25) — i componenti che usano `m.*` (BlurText,
// Curriculum stesso) richiedono un ancestor LazyMotion con le feature
// caricate, altrimenti motion/react lancia in dev.
function AllProviders({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>
}

function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export * from "@testing-library/react"
export { renderWithProviders as render }
