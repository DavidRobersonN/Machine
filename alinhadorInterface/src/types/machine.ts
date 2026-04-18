export type LedBackendState = 'ON' | 'OFF'
export type LedUiState = 'Ligado' | 'Desligado'
export type ArduinoConnectionState = 'Conectado' | 'Desconectado'

export type MotorDirection = 'tighten' | 'loosen'

export type MachineLog = {
  direction: 'sent' | 'received'
  message: string
}

export interface MachineState {
  connected: boolean
  led: LedUiState
  arduino_connected: ArduinoConnectionState
  logs: MachineLog[]
}

export interface MachineUpdatePayload {
  led?: LedBackendState
  arduino_connected?: boolean
}

export interface MachineUpdateMessage {
  type: 'machine_update'
  payload: MachineUpdatePayload
}

export interface ConnectionMessage {
  type: 'connection'
  status: 'connected' | 'disconnected'
  message: string
}

export interface ErrorMessage {
  type: 'error'
  message: string
}

export interface InfoMessage {
  type: 'info'
  message: string
  received?: unknown
}

export type MachineMessage =
  | MachineUpdateMessage
  | ConnectionMessage
  | ErrorMessage
  | InfoMessage

export type MachineAction =
  | { type: 'SOCKET_CONNECTED' }
  | { type: 'SOCKET_DISCONNECTED' }
  | { type: 'MACHINE_UPDATED'; payload: MachineUpdatePayload }
  | {
      type: 'ADD_LOG'
      payload: {
        direction: 'sent' | 'received'
        message: string
      }
    }
  | { type: 'CLEAR_LOGS' }