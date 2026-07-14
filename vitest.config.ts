import { mergeConfig } from "vite"
import { defineConfig as defineVitestConfig } from "vitest/config"
import viteConfig from "./vite.config"

// Config di test separata da vite.config.ts (che resta focalizzata sulla
// build di produzione — nessun rischio di toccare il pipeline di deploy).
// Riusa plugin/alias della build via mergeConfig così i test vedono lo
// stesso resolver (`@/...`) e lo stesso JSX transform del progetto.
export default mergeConfig(
  viteConfig,
  defineVitestConfig({
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      css: false,
    },
  })
)
