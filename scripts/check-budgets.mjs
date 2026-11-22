// Budget di peso (gzip livello 9) e controllo dei colori nel CSS compilato. Esce con 1 al primo sforamento.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { gzipSync } from "node:zlib"

const KB = 1024
const gz = (file) => gzipSync(readFileSync(file), { level: 9 }).length
let failed = false
const check = (label, value, max, unit = "KB") => {
  const ok = value <= max
  if (!ok) failed = true
  console.log(`${ok ? "ok  " : "FAIL"} ${label}: ${(value / KB).toFixed(1)} ${unit} (max ${(max / KB).toFixed(0)})`)
}

if (!existsSync("dist/index.html")) {
  console.error("budgets: manca dist/index.html, lancia prima npm run build")
  process.exit(1)
}
const html = readFileSync("dist/index.html", "utf8")
const assets = readdirSync("dist/assets")

// HTML + CSS bloccanti della home.
const cssFiles = [...html.matchAll(/<link rel="stylesheet"[^>]*href="\/(assets\/[^"]+)"/g)].map((m) => m[1])
const blocking = gz("dist/index.html") + cssFiles.reduce((s, f) => s + gz(join("dist", f)), 0)
check("HTML + CSS bloccanti della home", blocking, 40 * KB)

// JS d'ingresso: lo script del modulo e i modulepreload dichiarati nell'HTML.
const entry = new Set(
  [...html.matchAll(/<(?:script type="module"[^>]*src|link rel="modulepreload"[^>]*href)="\/(assets\/[^"]+\.js)"/g)].map((m) => m[1]),
)
// La pagina carica anche il chunk dei testi della sua lingua (il più pesante dei due).
const locales = assets.filter((f) => /^(it|en)-.*.js$/.test(f))
const localeGz = Math.max(0, ...locales.map((f) => gz(join("dist/assets", f))))
check("JS d'ingresso (con i testi di una lingua)", [...entry].reduce((s, f) => s + gz(join("dist", f)), 0) + localeGz, 110 * KB)

// JS di animazione: i chunk differiti (tutto ciò che non è d'ingresso e non è basic.js).
const lazy = assets.filter((f) => f.endsWith(".js") && !entry.has(`assets/${f}`) && !f.startsWith("basic-") && !locales.includes(f))
const anim = lazy.reduce((s, f) => s + gz(join("dist/assets", f)), 0)
check(`JS di animazione (${lazy.join(", ") || "nessun chunk"})`, anim, 45 * KB)
const basic = assets.find((f) => f.startsWith("basic-"))
if (basic) check("basic.js", gz(join("dist/assets", basic)), 2 * KB)

// Font scaricati sulla home: al massimo 4 file e 280 KB.
const fonts = assets.filter((f) => f.endsWith(".woff2"))
if (fonts.length > 4) {
  failed = true
  console.log(`FAIL font: ${fonts.length} file (max 4)`)
} else {
  console.log(`ok   font: ${fonts.length} file`)
}
check("font, peso totale", fonts.reduce((s, f) => s + statSync(join("dist/assets", f)).size, 0), 280 * KB)

// Foto dell'hero, se già ottimizzate.
for (const [f, max] of [
  ["notte-finestra-orizz-1440.avif", 180 * KB],
  ["notte-finestra-vert-640.avif", 70 * KB],
]) {
  const p = join("dist/img", f)
  if (existsSync(p)) check(f, statSync(p).size, max)
  else console.log(`skip ${f}: foto non ancora presente`)
}

// Colori nel CSS compilato: solo i 7 della palette (esadecimali e rgb(… / a)).
const PALETTE_HEX = new Set(["#17123a", "#231c4d", "#5a5482", "#a99bf0", "#ffb59a", "#ffd98a", "#fff4ef"])
const PALETTE_RGB = new Set(["23 18 58", "35 28 77", "90 84 130", "169 155 240", "255 181 154", "255 217 138", "255 244 239"])
const offenders = new Set()
for (const f of cssFiles.length ? cssFiles : assets.filter((a) => a.endsWith(".css")).map((a) => `assets/${a}`)) {
  const css = readFileSync(join("dist", f), "utf8")
  for (const m of css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
    const hex = m[0].toLowerCase()
    // Il minificatore scrive rgb(… / a) come esadecimale a 8 cifre: conta il colore base. #0000 è il «trasparente» di Tailwind.
    const base = hex.length === 9 ? hex.slice(0, 7) : hex
    if (!PALETTE_HEX.has(base) && hex !== "#0000") offenders.add(hex)
  }
  for (const m of css.matchAll(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/g)) {
    if (!PALETTE_RGB.has(`${m[1]} ${m[2]} ${m[3]}`)) offenders.add(m[0])
  }
  for (const m of css.matchAll(/\b(?:hsla?|oklch|oklab|lab|lch)\([^)]*\)/g)) offenders.add(m[0])
}
if (offenders.size) {
  failed = true
  console.log(`FAIL colori fuori palette nel CSS: ${[...offenders].join(", ")}`)
} else {
  console.log("ok   colori: solo la palette")
}

process.exit(failed ? 1 : 0)
