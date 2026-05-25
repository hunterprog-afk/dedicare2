import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { Mail, ArrowUpRight, Newspaper, AlertCircle } from "lucide-react"
import { useTranslation } from "react-i18next"
import { BlurText } from "@/components/BlurText"

type FeedItem = {
  title: string
  url: string
  pubDate: string
  source?: string
  description?: string
  imageUrl?: string | null
}

// ─── Apify static JSON (generated at build time) ────────────────────────────
type ApifyArticle = {
  title: string
  url: string
  source?: string
  publishedAt?: string
  imageUrl?: string | null
  description?: string
}

// ─── RSS fallback (rss2json) ─────────────────────────────────────────────────
type Rss2JsonResponse = {
  status: string
  feed?: { title?: string }
  items?: Array<{
    title: string
    link: string
    pubDate: string
    author?: string
    description?: string
  }>
}

const GRADIENTS = [
  "linear-gradient(135deg, #15A89A 0%, #0B5FA5 100%)",
  "linear-gradient(135deg, #0B5FA5 0%, #161D2E 100%)",
  "linear-gradient(135deg, #161D2E 0%, #15A89A 100%)",
]

// Feed RSS — focus SALUTE pubblica + TECNOLOGIA sanitaria (esclude assistenza/caregiver)
const FEEDS_BY_LANG: Record<string, string> = {
  it: "https://news.google.com/rss/search?q=%28salute+OR+telemedicina+OR+sanit%C3%A0+digitale+OR+intelligenza+artificiale+medicina+OR+prevenzione%29+-assistenza+-domiciliare+-caregiver&hl=it&gl=IT&ceid=IT:it",
  en: "https://news.google.com/rss/search?q=%28health+OR+telemedicine+OR+digital+health+OR+AI+medicine+OR+health+tech+OR+prevention%29+-caregiver+-homecare&hl=en-US&gl=US&ceid=US:en",
}

const RSS_PROXY = "https://api.rss2json.com/v1/api.json?rss_url="

// 🚫 Filtra notizie su assistenza domiciliare/caregiver — il sito vuole solo salute & healthtech
const EXCLUDE_PATTERNS: RegExp[] = [
  /\bcaregiver\b/i,
  /\bassistenza\s+domiciliar/i,
  /\bADI\b/,
  /\bassistente\s+familiar/i,
  /\bbadant/i,
  /assistenza\s+anziani/i,
  /assistenza\s+infermieristic/i,
  /assistenza\s+ospedalier/i,
  /\bhome\s*care\b/i,
]

function isAllowedTopic(title: string, description: string | undefined = ""): boolean {
  const haystack = `${title} ${description ?? ""}`
  return !EXCLUDE_PATTERNS.some((rx) => rx.test(haystack))
}

function extractSource(item: { author?: string; title: string }): string {
  if (item.author) return item.author
  const dashIdx = item.title.lastIndexOf(" - ")
  if (dashIdx > 0 && dashIdx > item.title.length - 50) {
    return item.title.slice(dashIdx + 3)
  }
  return ""
}

function cleanTitle(title: string, source: string): string {
  if (source && title.endsWith(` - ${source}`)) {
    return title.slice(0, title.length - source.length - 3)
  }
  return title
}

function formatDate(pubDate: string, lang: string): string {
  try {
    const d = new Date(pubDate)
    return d.toLocaleDateString(lang === "en" ? "en-US" : "it-IT", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return pubDate
  }
}

// ─── Card ────────────────────────────────────────────────────────────────────

function ArticleCard({ item, index }: { item: FeedItem; index: number }) {
  const { i18n } = useTranslation()
  const [imgError, setImgError] = useState(false)
  const showImage = item.imageUrl && !imgError

  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="liquid-glass rounded-2xl overflow-hidden flex flex-col group hover:scale-[1.01] transition-transform"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
    >
      {/* Cover — real image or gradient fallback */}
      <div className="relative h-44 w-full overflow-hidden">
        {showImage ? (
          <img
            src={item.imageUrl!}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: GRADIENTS[index % GRADIENTS.length] }}
          />
        )}

        {/* Overlay sempre presente per leggibilità */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 noise opacity-30 pointer-events-none" />

        {/* Live badge */}
        <span
          className="absolute top-4 right-4 rounded-full px-3 py-1 font-body text-[11px] tracking-wide uppercase text-white inline-flex items-center gap-1.5"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>

        {/* Source */}
        <span className="absolute bottom-4 left-5 font-display uppercase text-xs tracking-wider text-white/90 drop-shadow">
          {item.source}
        </span>
        <ArrowUpRight className="absolute bottom-4 right-5 size-4 text-white/70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col gap-3 flex-1">
        <span className="font-body text-xs text-foreground/55 tracking-wide uppercase">
          {formatDate(item.pubDate, i18n.language)}
        </span>
        <h3 className="font-display uppercase text-lg leading-tight tracking-tight line-clamp-3 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        {item.description && (
          <p className="font-body text-sm text-foreground/60 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
        <div className="mt-auto pt-4 h-px w-10 bg-gradient-to-r from-primary to-transparent" />
      </div>
    </motion.a>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Blog() {
  const { t, i18n } = useTranslation()
  const [items, setItems] = useState<FeedItem[]>([])
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading")
  const [source, setSource] = useState<"apify" | "rss">("apify")

  useEffect(() => {
    let cancelled = false
    setStatus("loading")

    async function load() {
      // 1️⃣  Try Apify pre-built JSON (fast, has images, no API key in browser)
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}blog-posts.json`)
        if (res.ok) {
          const data: ApifyArticle[] = await res.json()
          if (!cancelled && Array.isArray(data) && data.length > 0) {
            // Filtra eventuali articoli su assistenza/caregiver (doppio safety net)
            const filtered = data.filter((a) => isAllowedTopic(a.title, a.description))
            setItems(
              filtered.slice(0, 6).map((a) => ({
                title: a.title,
                url: a.url,
                pubDate: a.publishedAt ?? new Date().toISOString(),
                source: a.source ?? "Apify News",
                description: a.description,
                imageUrl: a.imageUrl,
              }))
            )
            setSource("apify")
            setStatus("ok")
            return
          }
        }
      } catch {
        // fall through to RSS
      }

      // 2️⃣  Fallback: RSS via rss2json
      try {
        const lang = i18n.language.startsWith("en") ? "en" : "it"
        const feedUrl = FEEDS_BY_LANG[lang] ?? FEEDS_BY_LANG.it
        const res = await fetch(`${RSS_PROXY}${encodeURIComponent(feedUrl)}`)
        const data: Rss2JsonResponse = await res.json()

        if (cancelled) return
        if (data.status !== "ok" || !data.items?.length) {
          setStatus("error")
          return
        }

        const parsed: FeedItem[] = data.items
          .filter((it) => isAllowedTopic(it.title, it.description))
          .slice(0, 3)
          .map((it) => {
            const src = extractSource(it)
            return {
              title: cleanTitle(it.title, src),
              url: it.link,
              pubDate: it.pubDate,
              source: src || "Google News",
            }
          })

        if (!cancelled) {
          setItems(parsed)
          setSource("rss")
          setStatus("ok")
        }
      } catch {
        if (!cancelled) setStatus("error")
      }
    }

    load()
    return () => { cancelled = true }
  }, [i18n.language])

  return (
    <section id="blog" data-section="light" className="relative py-16 md:py-40 border-t border-border/40">
      <div className="max-w-[var(--max)] mx-auto px-[var(--gutter)]">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-foreground/80 inline-flex items-center gap-2">
            <Newspaper className="size-3.5" />
            {t("blog.eyebrow")}
          </span>
          <BlurText
            key={i18n.language + "-blog-title"}
            text={t("blog.title")}
            as="h2"
            className="mt-4 font-display uppercase text-[clamp(32px,8vw,60px)] md:text-6xl leading-[0.95] md:leading-[0.9] tracking-tight break-words"
            delay={0.07}
          />
          <motion.p
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="mt-4 font-body text-foreground/60 text-base max-w-[52ch] leading-relaxed"
          >
            {t("blog.intro")}
          </motion.p>
        </div>

        {/* Loading skeleton */}
        {status === "loading" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="liquid-glass rounded-2xl overflow-hidden flex flex-col">
                <div className="h-44 w-full video-shimmer" />
                <div className="p-6 flex flex-col gap-3">
                  <div className="h-3 w-24 rounded video-shimmer" />
                  <div className="h-5 w-full rounded video-shimmer" />
                  <div className="h-5 w-3/4 rounded video-shimmer" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="liquid-glass rounded-2xl p-8 flex items-center gap-4">
            <AlertCircle className="size-5 text-primary shrink-0" />
            <p className="font-body text-sm text-foreground/70">
              {t("blog.error")}
            </p>
          </div>
        )}

        {/* Articles grid — up to 6 when Apify, 3 for RSS */}
        {status === "ok" && (
          <div className={`grid grid-cols-1 gap-5 ${source === "apify" ? "md:grid-cols-3" : "md:grid-cols-3"}`}>
            {items.map((a, i) => (
              <ArticleCard key={a.url} item={a} index={i} />
            ))}
          </div>
        )}

        {/* Attribution */}
        {status === "ok" && (
          <p className="mt-6 font-body text-xs text-foreground/40 text-center">
            {source === "apify"
              ? "Notizie selezionate automaticamente da Apify · aggiornate ad ogni deploy"
              : t("blog.source_note")}
          </p>
        )}

        {/* CTA */}
        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <a
            href="mailto:info@dedicaresolutions.it?subject=Iscrizione%20blog%20Dedicare%20Solutions&body=Vorrei%20essere%20avvisato%20alla%20pubblicazione%20dei%20nuovi%20articoli."
            className="group liquid-glass inline-flex items-center gap-3 rounded-full px-7 py-4 font-body text-sm tracking-wide transition-all hover:scale-[1.02]"
          >
            <Mail className="size-4" />
            {t("blog.cta")}
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
