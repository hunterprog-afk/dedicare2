import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ArrowUpRight, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NAV_ITEMS } from "@/lib/constants"

export function Navbar() {
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
        <div className="liquid-glass rounded-full px-2 py-2 flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 pl-3 shrink-0">
            <img
              src={`${import.meta.env.BASE_URL}images/logo/logo-chiaro.png`}
              alt="Dedicare Solutions"
              className="h-8 w-auto object-contain hidden sm:block"
            />
            <img
              src={`${import.meta.env.BASE_URL}images/logo/pitto-chiaro.png`}
              alt="Dedicare Solutions"
              className="h-8 w-auto object-contain sm:hidden"
            />
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.href
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`relative px-3.5 py-2 text-sm font-body transition-colors ${
                    isActive ? "text-foreground" : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                  )}
                </a>
              )
            })}
          </nav>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-2 pr-1">
            <Button
              variant="heroSolid"
              size="sm"
              className="rounded-full px-4 py-1.5 text-sm hidden sm:inline-flex focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              asChild
            >
              <a href="#contatti">
                Contattaci <ArrowUpRight className="ml-1 size-4" />
              </a>
            </Button>
            <button
              className="md:hidden liquid-glass rounded-full w-9 h-9 flex items-center justify-center text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
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
            className="fixed inset-0 z-40 liquid-glass-strong flex flex-col items-center justify-center gap-6 px-8"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="font-display uppercase text-3xl tracking-tight text-foreground/90 hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
            <Button variant="hero" className="mt-4" asChild>
              <a href="#contatti" onClick={() => setMobileOpen(false)}>
                Contattaci <ArrowUpRight className="ml-1 size-4" />
              </a>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
