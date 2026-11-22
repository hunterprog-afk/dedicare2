// Controforma della D normalizzata 0-1 (ricavata dal campo `inner` della geometria del logo):
// serve a ritagliare la foto dei contatti. Rapporto larghezza/altezza 0,645.
export const D_WINDOW_PATH =
  "M0.0000 0.0000 0.1200 0.0019 0.2183 0.0068 0.3090 0.0151 0.3938 0.0264 0.4728 0.0411 0.5477 0.0589 0.6167 0.0796 0.6811 0.1034 0.7402 0.1302 0.7934 0.1596 0.8408 0.1917 0.8824 0.2264 0.9181 0.2638 0.9473 0.3034 0.9702 0.3457 0.9871 0.3909 0.9971 0.4400 1.0000 0.5000 0.9971 0.5600 0.9871 0.6091 0.9702 0.6543 0.9473 0.6966 0.9181 0.7362 0.8824 0.7736 0.8408 0.8083 0.7934 0.8404 0.7402 0.8698 0.6811 0.8966 0.6167 0.9204 0.5477 0.9411 0.4728 0.9589 0.3938 0.9736 0.3090 0.9849 0.2183 0.9932 0.1200 0.9981 0.0000 1.0000Z"

/** Definita una volta nel body: `clip-path: url(#d-window)`. */
export function DWindow() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <clipPath id="d-window" clipPathUnits="objectBoundingBox">
        <path d={D_WINDOW_PATH} />
      </clipPath>
    </svg>
  )
}

/** Contorno della D, sopra la foto: lo stesso tracciato del ritaglio, filetto da 2 px in gradiente oro-pesca. */
export function DWindowLine() {
  return (
    <svg className="d-window-line" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="d-line" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd98a" />
          <stop offset="1" stopColor="#ffb59a" />
        </linearGradient>
      </defs>
      <path d={D_WINDOW_PATH} />
    </svg>
  )
}
