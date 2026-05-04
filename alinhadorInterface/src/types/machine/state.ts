// Responsável pelo estado global da aplicação.

export type LedBackendState = 'ON' | 'OFF'
export type LedUiState = 'Ligado' | 'Desligado'

export type ArduinoConnectionState = 'Conectado' | 'Desconectado'

export type SelectedSerialPortState = string | null

export type MachineLog = {
  direction: 'sent' | 'received'
  message: string
}

export type SerialPortInfo = {
  device: string
  description: string
  hwid: string
}

export type MisalignmentPoint = {
  id: number
  value: number
}

export interface MachineState {
  connected: boolean
  led: LedUiState
  arduino_connected: ArduinoConnectionState
  logs: MachineLog[]
  available_ports: SerialPortInfo[]
  selected_port: SelectedSerialPortState
  speed_motor_roda: number

  lateral_misalignment_current: number
  lateral_misalignment_history: MisalignmentPoint[]
  is_lateral_reading_enabled: boolean
}