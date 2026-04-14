import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react'
import { useMachineSocket } from '../hooks/useMachineSocket'
import { initialMachineState, machineReducer } from './machineReducer'
import type { MachineMessage, MachineState } from '../types/machine'

type MachineContextValue = {
  state: MachineState
  sendCommand: (payload: unknown) => boolean
}

const MachineContext = createContext<MachineContextValue | undefined>(undefined)

export function MachineProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(machineReducer, initialMachineState)

  const handleConnected = useCallback(() => {
    dispatch({ type: 'SOCKET_CONNECTED' })
  }, [])

  const handleDisconnected = useCallback(() => {
    dispatch({ type: 'SOCKET_DISCONNECTED' })
  }, [])

  const handleMachineMessage = useCallback((message: MachineMessage) => {
    if (message.type === 'machine_update') {
      dispatch({
        type: 'MACHINE_UPDATED',
        payload: message.payload,
      })
    }
  }, [])

  const { send } = useMachineSocket({
    onConnected: handleConnected,
    onDisconnected: handleDisconnected,
    onMachineMessage: handleMachineMessage,
  })

  const value = useMemo(
    () => ({
      state,
      sendCommand: send,
    }),
    [state, send],
  )

  return (
    <MachineContext.Provider value={value}>
      {children}
    </MachineContext.Provider>
  )
}

export function useMachineContext() {
  const context = useContext(MachineContext)

  if (!context) {
    throw new Error(
      'useMachineContext precisa ser usado dentro de MachineProvider',
    )
  }

  return context
}