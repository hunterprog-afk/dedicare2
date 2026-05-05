import { lazy, Suspense, useRef } from "react"
import { Navbar }       from "@/components/Navbar"
import { Hero }         from "@/components/Hero"
import { WhatsAppFab }  from "@/components/WhatsAppFab"

const ServicesBento = lazy(() => import("@/components/ServicesBento").then(m => ({ default: m.ServicesBento })))
const Pourquoi      = lazy(() => import("@/components/Pourquoi").then(m => ({ default: m.Pourquoi })))
const Process       = lazy(() => import("@/components/Process").then(m => ({ default: m.Process })))
const Stats         = lazy(() => import("@/components/Stats").then(m => ({ default: m.Stats })))
const Testimonials  = lazy(() => import("@/components/Testimonials").then(m => ({ default: m.Testimonials })))
const Faq           = lazy(() => import("@/components/Faq").then(m => ({ default: m.Faq })))
const CtaFooter     = lazy(() => import("@/components/CtaFooter").then(m => ({ default: m.CtaFooter })))

const LazyFallback = <div style={{ minHeight: '400px' }} />

export default function App() {
  const heroRef = useRef<HTMLElement>(null)

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      <main>
        <Hero scrollRef={heroRef} />
        <Suspense fallback={LazyFallback}>
          <ServicesBento />
          <Pourquoi />
          <Process />
          <Stats />
          <Testimonials />
          <Faq />
          <CtaFooter />
        </Suspense>
      </main>
      <WhatsAppFab />
    </div>
  )
}
