//Responsável pelo que o backend envia para o frontend.

import type {
  LedBackendState,
  MachineLog,
  SelectedSerialPortState,
  SerialPortInfo,
} from './state'

export interface MachineUpdatePayload {
  led?: LedBackendState
  arduino_connected?: boolean
  selected_port?: SelectedSerialPortState
  speed_motor_roda?: number
}

export interface MachineUpdateMessage {
  type: 'machine_update'
  payload: MachineUpdatePayload
}

export interface AvailablePortsMessage {
  type: 'available_ports'
  ports: SerialPortInfo[]
  selected_port?: SelectedSerialPortState
}

export interface SerialPortSelectedMessage {
  type: 'serial_port_selected'
  port: string
  message: string
}

export interface SerialPortDisconnectedMessage {
  type: 'serial_port_disconnected'
  message: string
}

export interface LedStatusMessage {
  type: 'led_status'
  state: LedBackendState
  serial: {
    success: boolean
    message: string
    command: string
    response: string | null
    arduino_connected: boolean
  }
}

export interface MachineReadMessage {
  type: 'machine_read'
  serial: {
    success: boolean
    message: string
    command: string
    response: string | null
    arduino_connected: boolean
  }
}

export interface ConnectionMessage {
  type: 'connection'
  status: 'connected' | 'disconnected'
  message: string
}

export interface LogMessage extends MachineLog {
  type: 'log'
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

export interface PongMessage {
  type: 'pong'
  message: string
}

export type MachineMessage =
  | MachineUpdateMessage
  | AvailablePortsMessage
  | SerialPortSelectedMessage
  | SerialPortDisconnectedMessage
  | LedStatusMessage
  | MachineReadMessage
  | ConnectionMessage
  | LogMessage
  | ErrorMessage
  | InfoMessage
  | PongMessage