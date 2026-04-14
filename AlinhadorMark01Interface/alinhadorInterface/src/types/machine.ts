export type LedBackendState = 'ON' | 'OFF'
export type LedUiState = 'Ligado' | 'Desligado' | 'Desconhecido'

export type MotorDirection = 'tighten' | 'loosen'


export interface MachineState {
  connected: boolean
  led: LedUiState
}

export interface MachineUpdatePayload {
  led?: LedBackendState
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