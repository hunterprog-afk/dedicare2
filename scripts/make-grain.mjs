// Grana del cielo: 128 × 128, rumore neutro con seme fisso, mai animata.
import { mkdirSync, statSync } from "node:fs"
import sharp from "sharp"

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SIZE = 128
const rand = mulberry32(2211)
const data = Buffer.alloc(SIZE * SIZE * 4)
for (let i = 0; i < SIZE * SIZE; i++) {
  const v = rand()
  const light = v > 0.5
  const c = light ? 255 : 0
  // Alfa in 16 livelli: tiene il file sotto i 20 KB (il rumore continuo a 8 bit non si comprime).
  const alpha = Math.min(255, Math.round((light ? v : 1 - v) * 15) * 17)
  data[i * 4] = c
  data[i * 4 + 1] = c
  data[i * 4 + 2] = c
  data[i * 4 + 3] = alpha
}

mkdirSync("public/img", { recursive: true })
await sharp(data, { raw: { width: SIZE, height: SIZE, channels: 4 } })
  .png({ compressionLevel: 9, palette: true, colors: 32 })
  .toFile("public/img/grana.png")
console.log(`grana.png: ${(statSync("public/img/grana.png").size / 1024).toFixed(1)} KB`)
