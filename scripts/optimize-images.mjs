// Ottimizza le foto dei lotti in public/img (AVIF + WebP) e scrive src/content/images.generated.json.
// Uso: npm run images [-- --src <cartella>]... [--flop <nome>]...
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import sharp from "sharp"

const DEFAULT_SRC = [
  "C:/Users/fabri/Desktop/Dedicare Sito/immagini/lotto-a",
  "C:/Users/fabri/Desktop/Dedicare Sito/immagini/lotto-b",
]
const NAMES = [
  "notte-finestra-orizz",
  "notte-finestra-vert",
  "notte-lampada",
  "notte-cucina",
  "alba-naviglio",
  "alba-naviglio-vert",
  "alba-persiane",
  "mattino-tazza",
  "mattino-accompagnamento",
  "giorno-piano",
  "giorno-gioco",
  "sera-balcone",
  "sera-balcone-vert",
  "ingresso-turno",
  "sera-tram",
]

const args = process.argv.slice(2)
const srcDirs = []
const flop = new Set()
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--src") srcDirs.push(args[++i])
  else if (args[i] === "--flop") flop.add(args[++i])
}
if (!srcDirs.length) srcDirs.push(...DEFAULT_SRC)

// Budget: foto dell'hero. Se superati, per quelle due sole si scende a AVIF qualità 42.
const BUDGET = { "notte-finestra-orizz-1440.avif": 180 * 1024, "notte-finestra-vert-640.avif": 70 * 1024 }

mkdirSync("public/img", { recursive: true })
const manifest = {}
const rows = []

for (const name of NAMES) {
  const dir = srcDirs.find((d) => existsSync(join(d, `${name}.png`)))
  if (!dir) continue
  const file = join(dir, `${name}.png`)
  const base = sharp(file)
  const { width: w, height: h } = await base.metadata()
  const vertical = h > w
  const targets = vertical ? [640, 1024] : [640, 960, 1440, 1920]
  const widths = targets.filter((t) => t <= w)
  if (!widths.length || Math.max(...widths) < w) widths.push(w)

  let total = 0
  for (const width of widths) {
    const pipeline = () => {
      let p = sharp(file)
      if (flop.has(name)) p = p.flop()
      return p.resize({ width, withoutEnlargement: true, kernel: "lanczos3" })
    }
    const avifPath = `public/img/${name}-${width}.avif`
    let q = 50
    const key = `${name}-${width}.avif`
    await pipeline().avif({ quality: q, effort: 6 }).toFile(avifPath)
    if (BUDGET[key] && statSync(avifPath).size > BUDGET[key]) {
      q = 42
      await pipeline().avif({ quality: q, effort: 6 }).toFile(avifPath)
    }
    await pipeline().webp({ quality: 72, effort: 5 }).toFile(`public/img/${name}-${width}.webp`)
    total += statSync(avifPath).size + statSync(`public/img/${name}-${width}.webp`).size
  }
  manifest[name] = { w, h, widths }
  rows.push([name, widths.join("/"), `${(total / 1024).toFixed(0)} KB`])
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
writeFileSync("src/content/images.generated.json", `${JSON.stringify(sorted, null, 2)}\n`)

if (!rows.length) console.log("Nessuna foto trovata nelle cartelle indicate: manifest vuoto, la home usa i segnaposto.")
for (const [n, w, kb] of rows) console.log(`${n.padEnd(26)} ${w.padEnd(22)} ${kb}`)
console.log(`${rows.length} foto ottimizzate su ${NAMES.length}`)
