import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ArrowUpRight, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OptimizedImage } from "@/components/OptimizedImage"
import { ThemeToggle } from "@/components/ThemeToggle"
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
        {/* Dark frosted glass pill — always readable over any section */}
        <div
          className="rounded-full px-2 py-2 flex items-center justify-between gap-4"
          style={{
            background: scrolled
              ? "rgba(8, 16, 40, 0.92)"
              : "rgba(8, 16, 40, 0.78)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          {/* Logo + wordmark */}
          <a href="#" className="flex items-center gap-3 pl-3 shrink-0" aria-label="Dedicare Solutions — home">
            <OptimizedImage
              src="images/logo/nobg_logo-chiaro"
              alt="Dedicare Solutions"
              width={160}
              height={32}
              className="h-8 w-auto object-contain hidden sm:block"
            />
            <OptimizedImage
              src="images/logo/nobg_pitto-chiaro"
              alt="Dedicare Solutions"
              width={32}
              height={32}
              className="h-8 w-auto object-contain sm:hidden"
            />
            <span
              aria-hidden="true"
              className="hidden lg:inline-block font-display uppercase text-sm tracking-wider text-white/85 leading-none pl-1 border-l border-white/15 ml-1"
              style={{ paddingLeft: "0.75rem" }}
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
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 w-3 rounded-full bg-primary" />
                  )}
                </a>
              )
            })}
          </nav>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-2 pr-1">
            <ThemeToggle />
            <Button
              variant="heroSolid"
              size="sm"
              className="rounded-full px-4 py-1.5 text-sm hidden sm:inline-flex focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              asChild
            >
              <a href="#contatti">
                Contattaci <ArrowUpRight className="ml-1 size-4" />
              </a>
            </Button>
            <button
              className="md:hidden rounded-full w-9 h-9 flex items-center justify-center text-white bg-white/10 hover:bg-white/18 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
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
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 px-8"
            style={{
              background: "rgba(8, 16, 40, 0.97)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="font-display uppercase text-3xl tracking-tight text-white/90 hover:text-white transition-colors"
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
