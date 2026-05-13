import { useContext } from 'react'

import { MachineContext } from './machineContextCore'

export function useMachineContext() {
  const context = useContext(MachineContext)

  if (!context) {
    throw new Error(
      'useMachineContext precisa ser usado dentro de MachineProvider',
    )
  }

  return context
}
