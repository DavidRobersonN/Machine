// Responsável pelo que o backend envia para o frontend.

import type {
  LedBackendState,
  MachineLog,
  SelectedSerialPortState,
  SerialPortInfo,
  WheelDirection,
} from './state'

export interface MachineUpdatePayload {
  led?: LedBackendState
  arduino_connected?: boolean
  selected_port?: SelectedSerialPortState
  speed_motor_roda?: number

  // =======================
  // RODA - GIRO CONTÍNUO / ESTADO GERAL
  // =======================

  wheel_position_degrees?: number
  wheel_total_turns?: number
  wheel_direction?: WheelDirection
  wheel_is_running?: boolean
  motor_turns_per_wheel_turn?: number

  // =======================
  // RODA - POSICIONAMENTO POR ÂNGULO / RAIO
  // =======================

  wheel_current_angle?: number
  wheel_target_angle?: number | null

  wheel_current_spoke?: number
  wheel_target_spoke?: number | null

  wheel_total_spokes?: number
  wheel_is_positioning?: boolean

  // =======================
  // SENSOR LATERAL
  // =======================

  lateral_misalignment_current?: number
  is_lateral_reading_enabled?: boolean

  // =======================
  // TENSÃO DOS RAIOS - HX711
  // =======================

  spoke_tension_left_kg?: number
  spoke_tension_right_kg?: number
  is_spoke_tension_collecting?: boolean
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

// Mensagem genérica para o Monitor Serial.
// Pode representar uma mensagem enviada ou recebida pela porta serial.
export interface SerialMessage {
  type: 'serial_message'
  direction: MachineLog['direction']
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
  | SerialMessage
  | LedStatusMessage
  | MachineReadMessage
  | ConnectionMessage
  | LogMessage
  | ErrorMessage
  | InfoMessage
  | PongMessage
