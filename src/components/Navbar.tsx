import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ArrowUpRight, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OptimizedImage } from "@/components/OptimizedImage"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LanguageToggle } from "@/components/LanguageToggle"
import { NAV_ITEMS } from "@/lib/constants"
import { useTranslation } from "react-i18next"

export function Navbar() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) =>
      document.querySelector(item.href) as HTMLElement | null
    )
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(`#${e.target.id}`)
        })
      },
      { threshold: 0.4 }
    )
    sections.forEach((s) => s && io.observe(s))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <header
        className={`fixed z-50 w-[min(1200px,calc(100vw-32px))] left-1/2 -translate-x-1/2 transition-all duration-300 ${scrolled ? "top-2" : "top-4"}`}
      >
        {/* Dark frosted glass pill — always readable over any section */}
        <div
          className="rounded-full p-2 flex items-center justify-between gap-4"
          style={{
            background: scrolled
              ? "rgba(8, 16, 40, 0.92)"
              : "rgba(8, 16, 40, 0.78)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          {/* Pittogramma + wordmark */}
          <a href="#top" className="flex items-center gap-3 pl-2 shrink-0" aria-label="Dedicare Solutions — home">
            <OptimizedImage
              src="images/logo/nobg_pitto-chiaro"
              alt="Dedicare Solutions"
              width={48}
              height={48}
              className="h-11 w-11 object-contain"
            />
            <span
              aria-hidden="true"
              className="hidden sm:inline-block font-display uppercase text-sm tracking-wider text-white/90 leading-none pl-3 border-l border-white/15"
            >
              Dedicare Solutions
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.href
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`relative px-3.5 py-2 text-sm font-body transition-colors rounded-full ${
                    isActive
                      ? "text-white bg-white/10"
                      : "text-white/70 hover:text-white hover:bg-white/8"
                  }`}
                >
                  {t(`nav.${item.key}`)}
                  {isActive && (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 w-3 rounded-full bg-primary" />
                  )}
                </a>
              )
            })}
          </nav>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-2 pr-1">
            <LanguageToggle />
            <ThemeToggle />
            <Button
              variant="heroSolid"
              size="sm"
              className="rounded-full px-4 py-1.5 text-sm hidden sm:inline-flex focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              asChild
            >
              <a href="#contatti">
                {t("nav.contattaci")} <ArrowUpRight className="ml-1 size-4" />
              </a>
            </Button>
            <button
              className="md:hidden rounded-full w-9 h-9 flex items-center justify-center text-white bg-white/10 hover:bg-white/18 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={t("nav.menu")}
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 px-8"
            style={{
              background: "rgba(8, 16, 40, 0.97)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="font-display uppercase text-3xl tracking-tight text-white/90 hover:text-white transition-colors"
              >
                {t(`nav.${item.key}`)}
              </a>
            ))}
            <Button variant="hero" className="mt-4" asChild>
              <a href="#contatti" onClick={() => setMobileOpen(false)}>
                {t("nav.contattaci")} <ArrowUpRight className="ml-1 size-4" />
              </a>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
