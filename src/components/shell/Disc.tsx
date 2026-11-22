/** Luna e sole: due cerchi di 112 px dietro a ogni foto e foglio, solo da 1024 px in su. */
export function Disc() {
  return (
    <div id="disc" aria-hidden="true">
      <div className="disc-moon" />
      <div className="disc-sun" />
    </div>
  )
}
