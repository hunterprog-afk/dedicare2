import { useCallback, useRef, useState } from "react"
import { validateValue, type FieldError, type Rule } from "@/lib/validation"

type Errors<K extends string> = Partial<Record<K, FieldError>>

/**
 * Stato di un modulo: valori, errori mostrati solo dopo l'uscita dal campo o all'invio,
 * rivalutazione a ogni battuta una volta mostrato l'errore.
 */
export function useForm<K extends string>(rules: Record<K, Rule>, initial: Record<K, string>) {
  const [values, setValues] = useState<Record<K, string>>(initial)
  const [errors, setErrors] = useState<Errors<K>>({})
  const [honeypot, setHoneypot] = useState("")
  const initialRef = useRef(initial)

  const setValue = useCallback(
    (name: K, value: string) => {
      setValues((v) => ({ ...v, [name]: value }))
      setErrors((e) => {
        if (!e[name]) return e
        const err = validateValue(value, rules[name])
        const next = { ...e }
        if (err) next[name] = err
        else delete next[name]
        return next
      })
    },
    [rules],
  )

  /** Riempie un campo solo se è vuoto (precompilazione dall'esterno). */
  const fillIfEmpty = useCallback((name: K, value: string) => {
    setValues((v) => (v[name].trim() === "" ? { ...v, [name]: value } : v))
  }, [])

  /** Uscita dal campo: valuta e mostra l'eventuale errore. */
  const blur = useCallback(
    (name: K) => {
      setErrors((e) => {
        const err = validateValue(values[name], rules[name])
        const next = { ...e }
        if (err) next[name] = err
        else delete next[name]
        return next
      })
    },
    [rules, values],
  )

  /** All'invio: valuta tutto e restituisce il primo campo non valido (o `null`). */
  const validateAll = useCallback((): K | null => {
    const next: Errors<K> = {}
    let first: K | null = null
    for (const n of Object.keys(rules) as K[]) {
      const err = validateValue(values[n], rules[n])
      if (err) {
        next[n] = err
        first ??= n
      }
    }
    setErrors(next)
    return first
  }, [rules, values])

  const reset = useCallback(() => {
    setValues(initialRef.current)
    setErrors({})
    setHoneypot("")
  }, [])

  return { values, errors, honeypot, setHoneypot, setValue, fillIfEmpty, blur, validateAll, reset }
}
