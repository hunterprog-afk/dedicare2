// Controlli sul risultato del build: file presenti, testo nell'HTML pre-renderizzato, assenze vietate.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

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
if (!/<h1[^>]*>[^<]*Home care,/.test(en)) fail("dist/en/index.html senza l'H1 inglese")

const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
const TEXT_EXT = /\.(html|js|css|json|xml|txt|svg|webmanifest|map)$/
const files = walk("dist").filter((f) => TEXT_EXT.test(f))
const m365 = Boolean(process.env.VITE_FORMS_API_BASE?.trim())
const banned = ["googletagmanager", "apify", "testimonials", "Trasparenza"]
if (m365) banned.push("formspree")
for (const f of files) {
  const content = readFileSync(f, "utf8")
  for (const b of banned) if (content.toLowerCase().includes(b.toLowerCase())) fail(`${f} contiene «${b}»`)
}
console.log(`check-dist: ok (${REQUIRED.length} file richiesti, ${files.length} file di testo controllati)`)
