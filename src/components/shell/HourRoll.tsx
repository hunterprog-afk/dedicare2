/** Ora della scena in cifre larghe: l'indicatore `data-film-hour` lo aggiorna il motore con un rullo verticale (src/film/hourRoll.ts). */
export function HourRoll({ time = "22:00" }: { time?: string }) {
  return (
    <span className="hour-roll" data-film-hour={time} aria-hidden="true">
      {time.split("").map((ch, i) =>
        ch === ":" ? (
          <span key={i} className="hr-colon">
            :
          </span>
        ) : (
          <span key={i} className="hr-c">
            <span>{ch}</span>
          </span>
        ),
      )}
    </span>
  )
}
