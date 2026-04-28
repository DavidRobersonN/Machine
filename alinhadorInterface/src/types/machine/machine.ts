export type {
  LedBackendState,
  LedUiState,
  ArduinoConnectionState,
  SelectedSerialPortState,
  MachineLog,
  SerialPortInfo,
  MisalignmentPoint,
  MachineState,
} from './state'

export type {
  MachineUpdatePayload,
  MachineUpdateMessage,
  AvailablePortsMessage,
  SerialPortSelectedMessage,
  SerialPortDisconnectedMessage,
  LedStatusMessage,
  MachineReadMessage,
  ConnectionMessage,
  LogMessage,
  ErrorMessage,
  InfoMessage,
  PongMessage,
  MachineMessage,
} from './messages'

export type { MachineAction } from './actions'

/* COMMANDS: frontend -> backend */

export type MotorRodaCommand =
  | { action: 'motor_roda_start' }
  | { action: 'motor_roda_stop' }
  | { action: 'motor_roda_set_clockwise' }
  | { action: 'motor_roda_set_counter_clockwise' }
  | { action: 'motor_roda_increase_speed' }
  | { action: 'motor_roda_decrease_speed' }

export interface ListSerialPortsCommand {
  action: 'list_serial_ports'
}

export interface SelectPortCommand {
  action: 'select_serial_port'
  port: string
}

export interface DisconnectSerialPortCommand {
  action: 'disconnect_serial_port'
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

export interface LateralSensorStatusCommand {
  action: 'lateral_sensor_status'
}

export interface LateralSensorCalibrateZeroCommand {
  action: 'lateral_sensor_calibrate_zero'
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
  | LateralSensorStatusCommand
  | LateralSensorCalibrateZeroCommand