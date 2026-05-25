/**
 * fetch-content.mjs
 * Apify build-time data fetcher for Dedicare Solutions
 *
 * Runs BEFORE the Vite build to populate:
 *   public/blog-posts.json      → healthcare news articles (with images)
 *   public/testimonials.json    → real Google Maps reviews
 *
 * Usage:
 *   node scripts/fetch-content.mjs
 *   APIFY_API_KEY=xxx node scripts/fetch-content.mjs
 *
 * If APIFY_API_KEY is missing or any actor fails, the script exits cleanly
 * and the React components fall back to their built-in data.
 */

import { writeFileSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = join(__dirname, "..", "public")
const TOKEN = process.env.APIFY_API_KEY
const BASE = "https://api.apify.com/v2"

if (!TOKEN) {
  console.warn("⚠️  APIFY_API_KEY not set — skipping content fetch, using fallback data.")
  process.exit(0)
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function saveJson(filename, data) {
  mkdirSync(PUBLIC_DIR, { recursive: true })
  writeFileSync(join(PUBLIC_DIR, filename), JSON.stringify(data, null, 2), "utf-8")
  console.log(`✅ Saved ${filename} (${data.length} items)`)
}

/**
 * Runs an Apify actor synchronously and returns the dataset items.
 * Uses the /run-sync-get-dataset-items endpoint.
 */
async function runActor(actorId, input, timeoutSecs = 90, memoryMb = 256) {
  const url = `${BASE}/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items` +
    `?token=${TOKEN}&timeout=${timeoutSecs}&memory=${memoryMb}&outputRecordKey=OUTPUT`

  console.log(`🔄 Running actor: ${actorId}`)

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Actor ${actorId} HTTP ${res.status}: ${text.slice(0, 200)}`)
  }

  const items = await res.json()
  if (!Array.isArray(items)) throw new Error(`Actor ${actorId} returned non-array: ${typeof items}`)
  console.log(`   → ${items.length} items received from ${actorId}`)
  return items
}

// ─── News ───────────────────────────────────────────────────────────────────

/**
 * Blocklist: parole/regex che, se presenti in titolo o description,
 * fanno scartare l'articolo. Target = solo notizie di SALUTE pubblica
 * e TECNOLOGIA sanitaria, NIENTE assistenza domiciliare/caregiver.
 */
const EXCLUDE_PATTERNS = [
  /\bcaregiver\b/i,
  /\bassistenza\s+domiciliar/i,
  /\bADI\b/,
  /\bassistente\s+familiar/i,
  /\bbadant/i,
  /assistenza\s+anziani/i,
  /assistenza\s+infermieristic/i,
  /assistenza\s+ospedalier/i,
]

function isAllowedTopic(item) {
  const haystack = `${item.title ?? ""} ${item.description ?? item.snippet ?? ""}`
  return !EXCLUDE_PATTERNS.some((rx) => rx.test(haystack))
}

async function fetchNews() {
  // Try multiple known actors in order until one works
  const NEWS_ACTORS = [
    {
      // apify/google-search-scraper — queries must be newline-separated string
      // Focus: SALUTE pubblica + TECNOLOGIA sanitaria. NIENTE assistenza/caregiver (filtrato sotto).
      id: "apify/google-search-scraper",
      input: {
        queries: "notizie ricerca medica Italia novità 2026\ntelemedicina app salute smartphone novità\nintelligenza artificiale diagnosi medicina precision health",
        maxPagesPerQuery: 1,
        resultsPerPage: 10,
        mobileResults: false,
        includeUnfilteredResults: false,
      },
    },
    {
      // Fallback: web scraper on Google News RSS
      // Salute + healthtech, esclude assistenza domiciliare e caregiver
      id: "apify/cheerio-scraper",
      input: {
        startUrls: [
          { url: "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3D%28salute%2BOR%2Btelemedicina%2BOR%2Bsanit%25C3%25A0%2Bdigitale%2BOR%2Bintelligenza%2Bartificiale%2Bmedicina%29%2B-assistenza%2B-domiciliare%2B-caregiver%26hl%3Dit%26gl%3DIT%26ceid%3DIT%3Ait" },
        ],
        pageFunction: `async function pageFunction(context) {
          const { $, request, log } = context;
          const body = $('body').text();
          try { return JSON.parse(body); } catch(e) { return {}; }
        }`,
        maxRequestsPerCrawl: 1,
      },
    },
  ]

  for (const actor of NEWS_ACTORS) {
    try {
      const items = await runActor(actor.id, actor.input, 120)

      // Google Search Scraper returns results nested in organicResults
      // Flatten: each SERP page item → its organicResults array
      const flatItems = items.flatMap((it) => {
        if (Array.isArray(it.organicResults) && it.organicResults.length > 0) {
          return it.organicResults
        }
        return [it] // fallback: item itself might be a result
      })

      if (flatItems.length > 0) {
        console.log(`   → Flat items: ${flatItems.length}, keys:`, Object.keys(flatItems[0]).join(", "))
      }

      const normalized = flatItems
        .filter((it) => {
          const title = it.title ?? it.titleText ?? ""
          const url = it.url ?? it.link ?? it.displayedUrl ?? ""
          const urlOk = url.startsWith("http") || url.startsWith("www.")
          return title.trim().length > 5 && urlOk
        })
        // 🚫 Post-filter: rimuovi tutto ciò che è assistenza/caregiver
        .filter(isAllowedTopic)
        .slice(0, 6)
        .map((it) => {
          let url = it.url ?? it.link ?? it.displayedUrl ?? "#"
          if (url.startsWith("www.")) url = "https://" + url
          const domain = url.replace(/^https?:\/\/([^/]+).*/, "$1")
          return {
            title: (it.title ?? "").trim(),
            url,
            source: it.source ?? domain ?? "Google",
            publishedAt: it.date ?? it.publishedAt ?? new Date().toISOString(),
            imageUrl: it.imageUrl ?? it.thumbnailUrl ?? null,
            description: (it.description ?? it.snippet ?? "").slice(0, 200),
          }
        })

      if (normalized.length > 0) {
        saveJson("blog-posts.json", normalized)
        return // success
      }
      console.warn(`   ↳ ${actor.id}: ${items.length} items but none passed filter`)
    } catch (err) {
      console.warn(`   ↳ ${actor.id} failed: ${err.message}`)
    }
  }

  console.warn("⚠️  All news actors failed — blog-posts.json not written")
}

// ─── Reviews ────────────────────────────────────────────────────────────────

async function fetchReviews() {
  try {
    const items = await runActor(
      "compass/google-maps-reviews-scraper",
      {
        startUrls: [
          {
            url: "https://www.google.com/maps/search/Dedicare+Solutions+Segrate+Milano",
          },
        ],
        maxReviews: 30,
        reviewsSort: "newest",
        language: "it",
      },
      180,
      512
    )

    // Debug: log first item's keys to understand the schema
    if (items.length > 0) {
      console.log("   → Review item keys:", Object.keys(items[0]).join(", "))
      console.log("   → Sample:", JSON.stringify(items[0]).slice(0, 300))
    }

    const normalized = items
      .filter((r) => {
        const text = r.text ?? r.textTranslated ?? r.reviewText ?? r.body ?? ""
        const stars = r.stars ?? r.rating ?? r.reviewRating ?? 0
        // Accept reviews with text (any length) and at least 3 stars
        return typeof text === "string" && text.trim().length > 5 && stars >= 3
      })
      .slice(0, 10)
      .map((r) => {
        const text = (r.text ?? r.textTranslated ?? r.reviewText ?? r.body ?? "").trim()
        const stars = r.stars ?? r.rating ?? r.reviewRating ?? 5
        const dateStr = r.publishedAtDate ?? r.date ?? r.publishedAt ?? ""
        let role = "Milano"
        if (dateStr) {
          try {
            role = new Date(dateStr).toLocaleDateString("it-IT", {
              month: "long",
              year: "numeric",
            })
          } catch {
            // ignore
          }
        }
        return {
          quote: text,
          name: r.name ?? r.reviewer ?? r.author ?? r.reviewerName ?? "Cliente verificato",
          role,
          stars,
        }
      })

    if (normalized.length > 0) {
      saveJson("testimonials.json", normalized)
    } else {
      console.warn("⚠️  No valid reviews received — testimonials.json not written")
    }
  } catch (err) {
    console.warn(`⚠️  Reviews fetch failed (${err.message}) — testimonials.json not written`)
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Apify content fetch starting…\n")

  // Run both in parallel — failures are independent
  await Promise.allSettled([fetchNews(), fetchReviews()])

  console.log("\n✅ Content fetch complete.")
}

main().catch((err) => {
  console.error("Fatal error in fetch-content.mjs:", err)
  process.exit(0) // soft exit — don't break the build
})
