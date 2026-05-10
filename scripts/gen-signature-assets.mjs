// Genera asset ottimizzati per la firma email (PNG, ~200px wide, < 30KB)
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const OUT_DIR = 'public/images/logo'
await mkdir(OUT_DIR, { recursive: true })

const targets = [
  { src: `${OUT_DIR}/nobg_logo-scuro.png`,  out: `${OUT_DIR}/sig-logo.png`,  width: 280 },
  { src: `${OUT_DIR}/nobg_pitto-scuro.png`, out: `${OUT_DIR}/sig-pitto.png`, width: 80 },
]

for (const t of targets) {
  const info = await sharp(t.src)
    .resize({ width: t.width, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile(t.out)
  console.log(`${t.out} → ${info.width}x${info.height} (${(info.size/1024).toFixed(1)} KB)`)
}
