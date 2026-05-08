// Responsável pelo que o frontend envia para o backend.

// =======================
// MOTOR DA RODA - GIRO CONTÍNUO
// =======================

export type MotorRodaCommand =
  | { action: 'motor_roda_start' }
  | { action: 'motor_roda_stop' }
  | { action: 'motor_roda_set_clockwise' }
  | { action: 'motor_roda_set_counter_clockwise' }
  | { action: 'motor_roda_increase_speed' }
  | { action: 'motor_roda_decrease_speed' }
  | { action: 'wheel_reset_position' }

// =======================
// MOTOR DA RODA - POSIÇÃO
// =======================

export interface MotorRodaSetZeroCommand {
  action: 'motor_roda_set_zero'
}

export interface MotorRodaGoToAngleCommand {
  action: 'motor_roda_go_to_angle'
  angle: number
}

export interface MotorRodaGoToSpokeCommand {
  action: 'motor_roda_go_to_spoke'
  spoke: number
}

export interface MotorRodaNextSpokeCommand {
  action: 'motor_roda_next_spoke'
}

export interface MotorRodaPreviousSpokeCommand {
  action: 'motor_roda_previous_spoke'
}

export interface MotorRodaPositionStatusCommand {
  action: 'motor_roda_position_status'
}

// =======================
// PORTA SERIAL
// =======================

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

// Comando genérico para enviar texto diretamente para o Arduino pela porta serial.
// Exemplo de uso no React:
// sendCommand({
//   action: 'serial_send_command',
//   command: 'LED_ON',
// })
export interface SerialSendCommand {
  action: 'serial_send_command'
  command: string
}

// =======================
// TESTE DE CONEXÃO
// =======================

export interface PingCommand {
  action: 'ping'
}

// =======================
// LED
// =======================

export interface LedOnCommand {
  action: 'led_on'
}

export interface LedOffCommand {
  action: 'led_off'
}

// =======================
// ESTADO DA MÁQUINA
// =======================

export interface ReadMachineStateCommand {
  action: 'read_machine_state'
}

// =======================
// SENSOR LATERAL
// =======================

export interface LateralSensorStatusCommand {
  action: 'lateral_sensor_status'
}

export interface LateralSensorCalibrateZeroCommand {
  action: 'lateral_sensor_calibrate_zero'
}

export interface LateralSensorStartReadingCommand {
  action: 'lateral_sensor_start_reading'
}

export interface LateralSensorStopReadingCommand {
  action: 'lateral_sensor_stop_reading'
}

// =======================
// UNION PRINCIPAL
// =======================

export type MachineCommand =
  | MotorRodaCommand
  | MotorRodaSetZeroCommand
  | MotorRodaGoToAngleCommand
  | MotorRodaGoToSpokeCommand
  | MotorRodaNextSpokeCommand
  | MotorRodaPreviousSpokeCommand
  | MotorRodaPositionStatusCommand
  | ListSerialPortsCommand
  | SelectPortCommand
  | DisconnectSerialPortCommand
  | SerialSendCommand
  | PingCommand
  | LedOnCommand
  | LedOffCommand
  | ReadMachineStateCommand
  | LateralSensorStatusCommand
  | LateralSensorCalibrateZeroCommand
  | LateralSensorStartReadingCommand
  | LateralSensorStopReadingCommand