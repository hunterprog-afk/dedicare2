// Controlli sul risultato del build: file presenti, testo nell'HTML pre-renderizzato, assenze vietate.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

try {
  process.loadEnvFile(".env.production")
} catch {
  /* nessun file: vale l'ambiente */
}

const fail = (msg) => {
  console.error(`check-dist: ${msg}`)
  process.exit(1)
}

const REQUIRED = [
  "index.html",
  "en/index.html",
  "privacy/index.html",
  "cookie/index.html",
  "note-legali/index.html",
  "informativa-candidati.html",
  "sitemap.xml",
  "robots.txt",
  "CNAME",
]
for (const f of REQUIRED) if (!existsSync(join("dist", f))) fail(`manca dist/${f}`)

const it = JSON.parse(readFileSync("src/i18n/locales/it.json", "utf8"))
const body = (html) => html.slice(html.indexOf("<body")).replace(/<script[\s\S]*?<\/script>/g, "")
// Il testo visibile: tolta la marcatura, entità decodificate, spazi e commenti di React normalizzati.
const visible = (html) =>
  body(html)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
const norm = (s) => s.replace(/\s+/g, " ").trim()

const home = readFileSync("dist/index.html", "utf8")
const text = visible(home)

// Le sezioni ancora segnaposto non hanno ancora i loro testi: il controllo si attiva da solo quando vengono sostituite.
const placeholders = [...home.matchAll(/data-placeholder="([^"]+)"/g)].map((m) => m[1])
if (placeholders.length) console.log(`check-dist: ATTENZIONE, segnaposto ancora presenti: ${placeholders.join(", ")}`)

if (!placeholders.includes("faq")) {
  for (const item of it.faq.items) if (!text.includes(norm(item.a))) fail(`risposta FAQ assente dall'HTML: «${item.a.slice(0, 50)}…»`)
}
for (const [key, id] of [
  ["assistenza247", "assistenza-24-7"],
  ["oss", "operatori-oss"],
  ["accompagnamento", "accompagnamento"],
  ["multidisciplinare", "multidisciplinare"],
]) {
  if (placeholders.includes(id)) continue
  if (!text.includes(norm(it.servizi.items[key].longDescription))) fail(`longDescription di ${key} assente dall'HTML`)
}

for (const marker of ['hreflang="it"', 'hreflang="en"', 'hreflang="x-default"', '"@type":"FAQPage"']) {
  if (!home.includes(marker)) fail(`dist/index.html non contiene ${marker}`)
}
const en = readFileSync("dist/en/index.html", "utf8")
if (!en.includes('<html lang="en"')) fail("dist/en/index.html non ha lang=en")
if (!/<h1[\s>]/.test(en) || !visible(en).includes("When someone is needed at home.")) fail("dist/en/index.html senza l'H1 inglese")
// Tutto il testo delle sette scene sta nell'HTML pre-renderizzato, in italiano e in inglese (non dentro il video).
const enJson = JSON.parse(readFileSync("src/i18n/locales/en.json", "utf8"))
for (const [label, json, html] of [["it", it, text], ["en", enJson, visible(en)]]) {
  for (const sc of json.film.scenes) {
    for (const part of [sc.title, sc.body, ...sc.tags]) if (!html.includes(norm(part))) fail(`testo di scena assente dall'HTML ${label}: «${part}»`)
  }
}
for (let n = 1; n <= 7; n++) for (const f of [`s${n}.mp4`, `s${n}-m.mp4`, `s${n}.jpg`, `s${n}-m.jpg`, `s${n}-foto.webp`, `s${n}-foto-m.webp`]) {
  if (!existsSync(join("dist/film", f))) fail(`manca dist/film/${f}`)
}

const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
const TEXT_EXT = /\.(html|js|css|json|xml|txt|svg|webmanifest|map)$/
const files = walk("dist").filter((f) => TEXT_EXT.test(f))
const m365 = Boolean(process.env.VITE_FORMS_API_BASE?.trim())
if (!m365) {
  // Modalità Formspree: i testi legali devono nominare il fornitore dei moduli configurato.
  const legal = ["dist/privacy/index.html", "dist/informativa-candidati.html"].map((f) =>
    readFileSync(f, "utf8")
      .replace(/<meta[^>]*Content-Security-Policy[^>]*>/gi, "")
      .toLowerCase(),
  )
  if (!legal.some((t) => t.includes("formspree"))) {
    if (process.env.DEDICARE_ANTEPRIMA === "1") {
      console.warn("check-dist: AVVISO, anteprima fuori produzione: i testi legali non nominano il fornitore dei moduli (Formspree).")
    } else {
      fail(
        "la build di produzione richiede che i testi legali corrispondano al fornitore dei moduli configurato. " +
          "I moduli usano Formspree ma né la Privacy né l'informativa candidati lo nominano: " +
          "definire VITE_FORMS_API_BASE con l'endpoint dei moduli oppure aggiornare i testi legali. " +
          "Per un'anteprima fuori produzione usare `npm run build:anteprima`.",
      )
    }
  }
}
const banned = ["googletagmanager", "apify", "testimonials", "Trasparenza"]
for (const f of files) {
  const content = readFileSync(f, "utf8")
  // Nei bundle JS l'endpoint alternativo resta come ramo non usato: in modalità M365 si controllano pagine e policy, non il codice.
  const list = m365 && !f.endsWith(".js") ? [...banned, "formspree"] : banned
  for (const b of list) if (content.toLowerCase().includes(b.toLowerCase())) fail(`${f} contiene «${b}»`)
}
console.log(`check-dist: ok (${REQUIRED.length} file richiesti, ${files.length} file di testo controllati)`)
