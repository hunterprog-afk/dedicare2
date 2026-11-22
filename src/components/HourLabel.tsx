import { cn } from "@/lib/cn"

interface HourLabelProps {
  /** Ora in formato HH:MM. */
  time: string
  /** `l` = capitolo grande, `s` = ore sulle foto e in testa alle sezioni. */
  size?: "l" | "s"
  className?: string
  style?: React.CSSProperties
}

export function HourLabel({ time, size = "s", className, style }: HourLabelProps) {
  return (
    <p className={cn("hour-label", size === "l" ? "hour-label-l" : "hour-label-s", className)} style={style}>
      <time dateTime={time}>{time}</time>
    </p>
  )
}
