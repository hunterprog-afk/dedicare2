import { clsx, type ClassValue } from "clsx"

/** Unisce i nomi di classe; le classi sono semantiche, quindi non serve alcun merge di conflitti. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
