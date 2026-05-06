// Generates favicon multi-size from the transparent pictogram.
// Input: public/images/logo/nobg_pitto-chiaro.png
// Outputs: public/favicon-{16,32,48,180,192,512}.png

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const input = path.join(projectRoot, 'public', 'images', 'logo', 'nobg_pitto-chiaro.png');
const outDir = path.join(projectRoot, 'public');

const sizes = [16, 32, 48, 180, 192, 512];

async function main() {
  await fs.access(input);
  const meta = await sharp(input).metadata();
  console.log(`Input: ${input}  (${meta.width}x${meta.height}, ${meta.format})`);

  for (const size of sizes) {
    const outPath = path.join(outDir, `favicon-${size}.png`);
    await sharp(input)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    const stat = await fs.stat(outPath);
    console.log(`  -> ${path.basename(outPath)}  ${stat.size} bytes`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
