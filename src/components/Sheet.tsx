import type { HTMLAttributes } from "react"
import { cn } from "@/lib/cn"

/** Foglio: fondo nebbia, raggio e ombra secondo il tono della sezione che lo contiene. */
export function Sheet({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("sheet", className)} {...props} />
}
