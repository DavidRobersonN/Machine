// Responsável pelo estado global da aplicação.

export type LedBackendState = 'ON' | 'OFF'
export type LedUiState = 'Ligado' | 'Desligado'

export type ArduinoConnectionState = 'Conectado' | 'Desconectado'

export type SelectedSerialPortState = string | null

export type WheelDirection = 'clockwise' | 'counter_clockwise' | 'stopped'

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

  // =======================
  // RODA - GIRO CONTÍNUO / ESTADO GERAL
  // =======================

  wheel_position_degrees: number
  wheel_total_turns: number
  wheel_direction: WheelDirection
  wheel_is_running: boolean
  motor_turns_per_wheel_turn: number

  // =======================
  // RODA - POSICIONAMENTO POR ÂNGULO / RAIO
  // =======================

  wheel_current_angle: number
  wheel_target_angle: number | null

  wheel_current_spoke: number
  wheel_target_spoke: number | null

  wheel_total_spokes: number
  wheel_is_positioning: boolean

  // =======================
  // SENSOR LATERAL
  // =======================

  lateral_misalignment_current: number
  lateral_misalignment_history: MisalignmentPoint[]
  is_lateral_reading_enabled: boolean

  // =======================
  // TENSÃO DOS RAIOS - HX711
  // =======================

  spoke_tension_left_kg: number
  spoke_tension_right_kg: number
  is_spoke_tension_collecting: boolean
}
