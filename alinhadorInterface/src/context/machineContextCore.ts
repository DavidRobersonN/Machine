import { createContext } from 'react'
import type { Dispatch } from 'react'

import type {
  MachineAction,
  MachineCommand,
  MachineState,
} from '../types/machine/machine'

export type MachineContextValue = {
  state: MachineState
  dispatch: Dispatch<MachineAction>
  send: (payload: MachineCommand) => boolean
  sendCommand: (payload: MachineCommand) => boolean
}

export const MachineContext = createContext<MachineContextValue | undefined>(
  undefined,
)
