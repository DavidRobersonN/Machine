import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  useEffect,
} from 'react'
import type { Dispatch, ReactNode } from 'react'

import { useMachineSocket } from '../hooks/useMachineSocket'
import { initialMachineState, machineReducer } from './machineReducer'
import type {
  MachineAction,
  MachineCommand,
  MachineMessage,
  MachineState,
} from '../types/machine/machine'

// O contexto da máquina é responsável por armazenar o estado global da máquina, e fornecer funções 
// para enviar comandos para o backend e receber mensagens do backend. Ele também é responsável por 
// manter um histórico dos valores de desalinhamento lateral, que são atualizados a cada 100ms com o 
// valor mais recente recebido do backend.

type MachineContextValue = {
  state: MachineState
  dispatch: Dispatch<MachineAction>
  send: (payload: MachineCommand) => boolean
  sendCommand: (payload: MachineCommand) => boolean
}

const MachineContext = createContext<MachineContextValue | undefined>(undefined)

type MachineProviderProps = {
  children: ReactNode
}

export function MachineProvider({ children }: MachineProviderProps) {
  const [state, dispatch] = useReducer(machineReducer, initialMachineState)


  const latestLateralValueRef = useRef(0)
  const hasReceivedLateralValueRef = useRef(false)

  // Sempre que receber um valor de desalinhamento lateral, atualizamos a referência mais recente e marcamos que já recebemos um valor
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (!hasReceivedLateralValueRef.current) {
        return
      }

      dispatch({
        type: 'ADD_LATERAL_MISALIGNMENT_POINT',
        payload: latestLateralValueRef.current,
      })
    }, 100)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])


  const handleConnected = useCallback(() => {
    dispatch({ type: 'SOCKET_CONNECTED' })

    dispatch({
      type: 'ADD_LOG',
      payload: {
        direction: 'received',
        message: 'WebSocket conectado com sucesso',
      },
    })
  }, [])

  const handleDisconnected = useCallback(() => {
    dispatch({ type: 'SOCKET_DISCONNECTED' })

    dispatch({
      type: 'ADD_LOG',
      payload: {
        direction: 'received',
        message: 'WebSocket desconectado',
      },
    })
  }, [])

  const handleMachineMessage = useCallback((message: MachineMessage) => {

    if (message.type === 'serial_port_disconnected') {
      dispatch({
        type: 'SET_SELECTED_PORT',
        payload: null,
      })

      dispatch({
        type: 'MACHINE_UPDATED',
        payload: {
          arduino_connected: false,
          selected_port: null,
        },
      })

      dispatch({
        type: 'ADD_LOG',
        payload: {
          direction: 'received',
          message: message.message,
        },
      })

      return
    }

if (message.type === 'machine_update') {
  const lateralValue = message.payload.lateral_misalignment_current

  if (lateralValue !== undefined) {
    latestLateralValueRef.current = lateralValue
    hasReceivedLateralValueRef.current = true
  }

  dispatch({
    type: 'MACHINE_UPDATED',
    payload: message.payload,
  })

  return
}

    if (message.type === 'log') {
      dispatch({
        type: 'ADD_LOG',
        payload: {
          direction: message.direction,
          message: message.message,
        },
      })
      return
    }

    if (message.type === 'error') {
      dispatch({
        type: 'ADD_LOG',
        payload: {
          direction: 'received',
          message: `Erro: ${message.message}`,
        },
      })
      return
    }

    if (message.type === 'info') {
      dispatch({
        type: 'ADD_LOG',
        payload: {
          direction: 'received',
          message: message.message,
        },
      })
      return
    }

    if (message.type === 'connection') {
      dispatch({
        type: 'ADD_LOG',
        payload: {
          direction: 'received',
          message: message.message,
        },
      })
      return
    }

    if (message.type === 'available_ports') {
      dispatch({
        type: 'SET_AVAILABLE_PORTS',
        payload: message.ports,
      })

      if (message.selected_port !== undefined) {
        dispatch({
          type: 'SET_SELECTED_PORT',
          payload: message.selected_port,
        })
      }

      dispatch({
        type: 'ADD_LOG',
        payload: {
          direction: 'received',
          message: `Portas encontradas: ${message.ports.length}`,
        },
      })
      return
    }

    if (message.type === 'serial_port_selected') {
      dispatch({
        type: 'SET_SELECTED_PORT',
        payload: message.port,
      })

      dispatch({
        type: 'ADD_LOG',
        payload: {
          direction: 'received',
          message: message.message,
        },
      })
      return
    }

    if (message.type === 'led_status') {
      dispatch({
        type: 'MACHINE_UPDATED',
        payload: {
          led: message.state,
          arduino_connected: message.serial.arduino_connected,
        },
      })

      dispatch({
        type: 'ADD_LOG',
        payload: {
          direction: 'received',
          message: message.serial.message,
        },
      })
      return
    }

    if (message.type === 'machine_read') {
      dispatch({
        type: 'MACHINE_UPDATED',
        payload: {
          arduino_connected: message.serial.arduino_connected,
        },
      })

      dispatch({
        type: 'ADD_LOG',
        payload: {
          direction: 'received',
          message: message.serial.message,
        },
      })
      return
    }

    if (message.type === 'pong') {
      dispatch({
        type: 'ADD_LOG',
        payload: {
          direction: 'received',
          message: message.message,
        },
      })
    }
  }, [])

  const { send } = useMachineSocket({
    onConnected: handleConnected,
    onDisconnected: handleDisconnected,
    onMachineMessage: handleMachineMessage,
  })

  const sendCommand = useCallback(
    (payload: MachineCommand) => {
      const success = send(payload)

      if (success) {
        dispatch({
          type: 'ADD_LOG',
          payload: {
            direction: 'sent',
            message: `Comando enviado: ${JSON.stringify(payload)}`,
          },
        })
      } else {
        dispatch({
          type: 'ADD_LOG',
          payload: {
            direction: 'received',
            message: 'Falha ao enviar comando: WebSocket não está conectado',
          },
        })
      }

      return success
    },
    [send],
  )

  const value = useMemo(
    () => ({
      state,
      dispatch,
      send,
      sendCommand,
    }),
    [state, dispatch, send, sendCommand],
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