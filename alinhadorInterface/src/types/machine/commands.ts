//Responsável pelo que o frontend envia para o backend.

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

export type MachineCommand =
  | MotorRodaCommand
  | ListSerialPortsCommand
  | SelectPortCommand
  | DisconnectSerialPortCommand
  | PingCommand
  | LedOnCommand
  | LedOffCommand
  | ReadMachineStateCommand