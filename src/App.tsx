import { lazy, Suspense, useRef } from "react"
import { Navbar }       from "@/components/Navbar"
import { Hero }         from "@/components/Hero"
import { WhatsAppFab }  from "@/components/WhatsAppFab"

const ServicesBento  = lazy(() => import("@/components/ServicesBento").then(m => ({ default: m.ServicesBento })))
const Assistiti      = lazy(() => import("@/components/Assistiti").then(m => ({ default: m.Assistiti })))
const Pourquoi       = lazy(() => import("@/components/Pourquoi").then(m => ({ default: m.Pourquoi })))
const Process        = lazy(() => import("@/components/Process").then(m => ({ default: m.Process })))
const AreeServite    = lazy(() => import("@/components/AreeServite").then(m => ({ default: m.AreeServite })))
const Stats          = lazy(() => import("@/components/Stats").then(m => ({ default: m.Stats })))
const Tariffario     = lazy(() => import("@/components/Tariffario").then(m => ({ default: m.Tariffario })))
const Testimonials   = lazy(() => import("@/components/Testimonials").then(m => ({ default: m.Testimonials })))
const Faq            = lazy(() => import("@/components/Faq").then(m => ({ default: m.Faq })))
const Curriculum     = lazy(() => import("@/components/Curriculum").then(m => ({ default: m.Curriculum })))
const CtaFooter      = lazy(() => import("@/components/CtaFooter").then(m => ({ default: m.CtaFooter })))

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
          <Assistiti />
          <Pourquoi />
          <Process />
          <AreeServite />
          <Stats />
          <Tariffario />
          <Testimonials />
          <Faq />
          <Curriculum />
          <CtaFooter />
        </Suspense>
      </main>
      <WhatsAppFab />
    </div>
  )
}
