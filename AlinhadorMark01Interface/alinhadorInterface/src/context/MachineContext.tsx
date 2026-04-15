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
import type { ReactNode } from 'react'

type MachineContextValue = {
  state: MachineState
  sendCommand: (payload: unknown) => boolean
}

// Criamos o contexto.
// Começa como undefined porque ele só vai existir dentro do Provider.
const MachineContext = createContext<MachineContextValue | undefined>(undefined)

type MachineProviderProps = {
  children: ReactNode
}

export function MachineProvider({ children }: MachineProviderProps) {
  // Estado global da máquina controlado pelo reducer
  const [state, dispatch] = useReducer(machineReducer, initialMachineState)

  // Quando o socket conectar, atualizamos o estado global
  const handleConnected = useCallback(() => {
    dispatch({ type: 'SOCKET_CONNECTED' })
  }, [])

  // Quando o socket desconectar, atualizamos o estado global
  const handleDisconnected = useCallback(() => {
    dispatch({ type: 'SOCKET_DISCONNECTED' })
  }, [])

  // Quando chegar uma mensagem do backend, analisamos o tipo dela
  const handleMachineMessage = useCallback((message: MachineMessage) => {
    if (message.type === 'machine_update') {
      dispatch({
        type: 'MACHINE_UPDATED',
        payload: message.payload,
      })
    }
  }, [])

  // Hook responsável por abrir e manter a conexão WebSocket
  // Ele recebe callbacks para avisar o Provider sobre eventos do socket
  const { send } = useMachineSocket({
    onConnected: handleConnected,
    onDisconnected: handleDisconnected,
    onMachineMessage: handleMachineMessage,
  })

  // Memoizamos o valor do contexto para evitar recriações desnecessárias
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

// Hook customizado para facilitar o uso do contexto
export function useMachineContext() {
  const context = useContext(MachineContext)

  // Proteção:
  // se alguém tentar usar o contexto fora do Provider,
  // mostramos um erro claro.
  if (!context) {
    throw new Error(
      'useMachineContext precisa ser usado dentro de MachineProvider',
    )
  }

  return context
}