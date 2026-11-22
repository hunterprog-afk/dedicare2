import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/** `false` nell'HTML pre-renderizzato e nel primo passaggio di idratazione, `true` subito dopo. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
