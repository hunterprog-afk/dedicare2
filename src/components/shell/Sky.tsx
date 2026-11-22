const LAYERS = ["S1", "S2", "S3", "S4", "S5", "S6", "S7"] as const

/** Cielo fisso: sette strati con gradiente statico; lo scroll cambia solo opacità e z-index (motore). */
export function Sky() {
  return (
    <div id="sky" aria-hidden="true">
      {LAYERS.map((l) => (
        <div key={l} className="sky-layer" data-layer={l} />
      ))}
      <div className="sky-grain" />
    </div>
  )
}
