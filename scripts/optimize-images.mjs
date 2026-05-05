// Convert all .png logos in public/images/logo to .webp (q=85).
// Originals are preserved as fallback for the <picture> element.
//
// Usage: node scripts/optimize-images.mjs
import { readdir, stat } from "node:fs/promises"
import { join, parse } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = fileURLToPath(new URL(".", import.meta.url))
const ROOT = join(__dirname, "..")
const TARGET_DIR = join(ROOT, "public", "images", "logo")
const QUALITY = 85

async function main() {
  const entries = await readdir(TARGET_DIR)
  const pngs = entries.filter((f) => f.toLowerCase().endsWith(".png"))

  if (pngs.length === 0) {
    console.log("No PNG files found in", TARGET_DIR)
    return
  }

  let totalPng = 0
  let totalWebp = 0

  for (const file of pngs) {
    const inPath = join(TARGET_DIR, file)
    const outPath = join(TARGET_DIR, parse(file).name + ".webp")

    const inStat = await stat(inPath)
    totalPng += inStat.size

    await sharp(inPath).webp({ quality: QUALITY }).toFile(outPath)

    const outStat = await stat(outPath)
    totalWebp += outStat.size

    const saved = (1 - outStat.size / inStat.size) * 100
    console.log(
      `${file.padEnd(32)} ${(inStat.size / 1024).toFixed(1)} KB -> ${(outStat.size / 1024).toFixed(1)} KB  (-${saved.toFixed(1)}%)`,
    )
  }

  const totalSaved = (1 - totalWebp / totalPng) * 100
  console.log(
    `\nTotal: ${(totalPng / 1024).toFixed(1)} KB -> ${(totalWebp / 1024).toFixed(1)} KB  (-${totalSaved.toFixed(1)}%)`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
