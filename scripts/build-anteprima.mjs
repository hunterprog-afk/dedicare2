// Build per le anteprime fuori produzione: imposta DEDICARE_ANTEPRIMA=1 (Windows e Linux) e lancia `npm run build`.
import { spawnSync } from "node:child_process"

const r = spawnSync("npm run build", {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, DEDICARE_ANTEPRIMA: "1" },
})
process.exit(r.status ?? 1)
