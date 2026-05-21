import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'
import type { ReactNode } from 'react'

import { useMachineSocket } from '../hooks/useMachineSocket'
import { MachineContext } from './machineContextCore'
import { initialMachineState, machineReducer } from './machineReducer'
import type {
  MachineCommand,
  MachineMessage,
  MachineUpdatePayload,
} from '../types/machine/machine'

// O contexto da máquina é responsável por armazenar o estado global da máquina,
// fornecer funções para enviar comandos para o backend e receber mensagens do backend.
// O valor atual e o histórico do sensor lateral são atualizados quando chega
// machine_update do backend.

type MachineProviderProps = {
  children: ReactNode
}

const LATERAL_PLAYBACK_INTERVAL_MS = 33
const MAX_LATERAL_BUFFER_POINTS = 30
const WHEEL_PLAYBACK_INTERVAL_MS = 16
const MAX_WHEEL_BUFFER_POINTS = 20

const WHEEL_REALTIME_KEYS = new Set<keyof MachineUpdatePayload>([
  'wheel_position_degrees',
  'wheel_total_turns',
  'wheel_current_angle',
  'wheel_current_spoke',
  'wheel_is_running',
  'wheel_is_positioning',
])

function isLateralSensorOnlyPayload(
  payload: MachineUpdatePayload,
): payload is MachineUpdatePayload & { lateral_misalignment_current: number } {
  return (
    Object.keys(payload).length === 1 &&
    payload.lateral_misalignment_current !== undefined
  )
}

function isWheelRealtimeOnlyPayload(payload: MachineUpdatePayload) {
  const payloadKeys = Object.keys(payload) as Array<keyof MachineUpdatePayload>

  return (
    payloadKeys.length > 0 &&
    payloadKeys.every((key) => WHEEL_REALTIME_KEYS.has(key)) &&
    (
      payload.wheel_position_degrees !== undefined ||
      payload.wheel_total_turns !== undefined
    )
  )
}

export function MachineProvider({ children }: MachineProviderProps) {
  const [state, dispatch] = useReducer(machineReducer, initialMachineState)
  const lateralBufferRef = useRef<number[]>([])
  const wheelBufferRef = useRef<MachineUpdatePayload[]>([])

  const playNextLateralValue = useCallback(() => {
    const lateralValue = lateralBufferRef.current.shift()

    if (lateralValue === undefined) {
      return
    }

    dispatch({
      type: 'MACHINE_UPDATED',
      payload: {
        lateral_misalignment_current: lateralValue,
      },
    })
  }, [])

  const enqueueLateralSensorValue = useCallback((lateralValue: number) => {
    lateralBufferRef.current.push(lateralValue)

    const overflow =
      lateralBufferRef.current.length - MAX_LATERAL_BUFFER_POINTS

    if (overflow > 0) {
      lateralBufferRef.current.splice(0, overflow)
    }
  }, [])

  const playNextWheelPayload = useCallback(() => {
    const wheelPayload = wheelBufferRef.current.shift()

    if (wheelPayload === undefined) {
      return
    }

    dispatch({
      type: 'MACHINE_UPDATED',
      payload: wheelPayload,
    })
  }, [])

  const enqueueWheelRealtimePayload = useCallback((
    wheelPayload: MachineUpdatePayload,
  ) => {
    if (wheelPayload.wheel_is_running === false) {
      wheelBufferRef.current = []

      dispatch({
        type: 'MACHINE_UPDATED',
        payload: wheelPayload,
      })

      return
    }

    wheelBufferRef.current.push(wheelPayload)

    const overflow =
      wheelBufferRef.current.length - MAX_WHEEL_BUFFER_POINTS

    if (overflow > 0) {
      wheelBufferRef.current.splice(0, overflow)
    }
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(
      playNextLateralValue,
      LATERAL_PLAYBACK_INTERVAL_MS,
    )

    return () => {
      window.clearInterval(intervalId)
    }
  }, [playNextLateralValue])

  useEffect(() => {
    const intervalId = window.setInterval(
      playNextWheelPayload,
      WHEEL_PLAYBACK_INTERVAL_MS,
    )

    return () => {
      window.clearInterval(intervalId)
    }
  }, [playNextWheelPayload])

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
      if (isLateralSensorOnlyPayload(message.payload)) {
        enqueueLateralSensorValue(message.payload.lateral_misalignment_current)

        return
      }

      if (isWheelRealtimeOnlyPayload(message.payload)) {
        enqueueWheelRealtimePayload(message.payload)

        return
      }

      if (message.payload.is_lateral_reading_enabled === false) {
        lateralBufferRef.current = []
      }

      if (message.payload.wheel_is_running === false) {
        wheelBufferRef.current = []
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

    if (message.type === 'serial_message') {
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
  }, [enqueueLateralSensorValue, enqueueWheelRealtimePayload])

  const { send } = useMachineSocket({
    onConnected: handleConnected,
    onDisconnected: handleDisconnected,
    onMachineMessage: handleMachineMessage,
  })

  // Esta função é usada para enviar comandos para o backend. Ela também adiciona uma entrada de log para cada comando enviado.
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
    [state, send, sendCommand],
  )

  return (
    <MachineContext.Provider value={value}>
      {children}
    </MachineContext.Provider>
  )
}
