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

export type MotorRodaCommand =
  | { action: 'motor_roda_start' }
  | { action: 'motor_roda_stop' }
  | { action: 'motor_roda_set_clockwise' }
  | { action: 'motor_roda_set_counter_clockwise' }

/* ESTADO GLOBAL DA APLICAÇÃO */
export interface MachineState {
  connected: boolean
  led: LedUiState
  arduino_connected: ArduinoConnectionState
  logs: MachineLog[]
  available_ports: SerialPortInfo[]
  selected_port: SelectedSerialPortState
}

/* COMMANDS: frontend -> backend */
export interface ListSerialPortsCommand {
  action: 'list_serial_ports'
}

export interface SelectPortCommand {
  action: 'select_serial_port'
  port: string
}

export interface PingCommand {
  action: 'ping'
}

export interface LedOnCommand {
  action: 'led_on'
}

export interface LedOffCommand {
  action: 'led_off'
}

export interface ReadMachineStateCommand {
  action: 'read_machine_state'
}

export interface DisconnectSerialPortCommand {
  action: 'disconnect_serial_port'
}

export interface SerialPortDisconnectedMessage {
  type: 'serial_port_disconnected'
  message: string
}

export type MachineCommand =
  | ListSerialPortsCommand
  | SelectPortCommand
  | DisconnectSerialPortCommand
  | PingCommand
  | LedOnCommand
  | LedOffCommand
  | ReadMachineStateCommand
  | MotorRodaCommand

/* MESSAGES: backend -> frontend */
export interface AvailablePortsMessage {
  type: 'available_ports'
  ports: SerialPortInfo[]
  selected_port?: SelectedSerialPortState
}

export interface MachineUpdatePayload {
  led?: LedBackendState
  arduino_connected?: boolean
  selected_port?: SelectedSerialPortState
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

export interface LogMessage {
  type: 'log'
  direction: 'sent' | 'received'
  message: string
}

export interface SerialPortSelectedMessage {
  type: 'serial_port_selected'
  port: string
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

export interface PongMessage {
  type: 'pong'
  message: string
}

export type MachineMessage =
  | AvailablePortsMessage
  | MachineUpdateMessage
  | ConnectionMessage
  | ErrorMessage
  | InfoMessage
  | LogMessage
  | SerialPortSelectedMessage
  | SerialPortDisconnectedMessage
  | LedStatusMessage
  | MachineReadMessage
  | PongMessage

/* ACTIONS: usadas pelo reducer */
export type MachineAction =
  | { type: 'SOCKET_CONNECTED' }
  | { type: 'SOCKET_DISCONNECTED' }
  | { type: 'MACHINE_UPDATED'; payload: MachineUpdatePayload }
  | { type: 'ADD_LOG'; payload: MachineLog }
  | { type: 'CLEAR_LOGS' }
  | { type: 'SET_AVAILABLE_PORTS'; payload: SerialPortInfo[] }
  | { type: 'SET_SELECTED_PORT'; payload: SelectedSerialPortState }