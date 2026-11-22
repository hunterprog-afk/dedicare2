import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/cn"
import { ArrowRightIcon } from "./icons"

interface CommonProps {
  /** `primary` riempie al passaggio; `secondary` è il contorno (WhatsApp). */
  variant?: "primary" | "secondary"
  /** Variante oro del tono scuro: aggiunge l'anello al passaggio. */
  gold?: boolean
  /** Icona a sinistra (solo secondario). */
  icon?: ReactNode
  block?: boolean
  children: ReactNode
  className?: string
}

type AnchorProps = CommonProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children">
type NativeButtonProps = CommonProps & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">

export function Button(props: AnchorProps | NativeButtonProps) {
  const { variant = "primary", gold, icon, block, children, className, ...rest } = props
  const classes = cn("btn", variant === "secondary" && "btn-secondary", gold && variant === "primary" && "btn-gold", block && "btn-block", className)
  const inner =
    variant === "secondary" ? (
      <>
        {icon}
        <span>{children}</span>
      </>
    ) : (
      <>
        <span>{children}</span>
        <ArrowRightIcon />
      </>
    )

  if ("href" in rest && rest.href !== undefined) {
    return (
      <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {inner}
      </a>
    )
  }
  return (
    <button type="button" className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {inner}
    </button>
  )
}
