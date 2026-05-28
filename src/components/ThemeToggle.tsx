import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Sun, Moon } from "lucide-react"
import { useTranslation } from "react-i18next"

type Theme = "dark" | "light"

const STORAGE_KEY = "dedicare-theme"

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark"
  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null
  if (stored === "dark" || stored === "light") return stored
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light"
  }
  return "dark"
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === "light") root.classList.add("light")
  else root.classList.remove("light")
}

export function ThemeToggle() {
  const { t } = useTranslation()
  // Lazy initializer: legge localStorage / prefers-color-scheme una sola volta al mount,
  // evitando un useEffect di sola inizializzazione.
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme())

  // Side effect: applica la classe `light` al root ogni volta che theme cambia.
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark"
    setTheme(next)
    applyTheme(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }

  const isDark = theme === "dark"
  const label = isDark ? t("theme.to_light") : t("theme.to_dark")

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="rounded-full w-9 h-9 flex items-center justify-center text-white bg-white/10 hover:bg-white/18 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex"
          >
            <Moon className="size-4" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex"
          >
            <Sun className="size-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
