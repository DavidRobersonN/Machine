// Responsável pelo que o frontend envia para o backend.

// =======================
// CONFIGURAÇÃO DA MÁQUINA
// =======================

export interface SyncMachineConfigCommand {
  action: 'sync_machine_config'
}

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
// TENSÃO DOS RAIOS - HX711
// =======================

export interface SpokeTensionStartCollectionCommand {
  action: 'spoke_tension_start_collection'
}

export interface SpokeTensionStopCollectionCommand {
  action: 'spoke_tension_stop_collection'
}

export interface SpokeTensionTareCommand {
  action: 'spoke_tension_tare'
  side: 'left' | 'right' | 'both'
}

export interface SpokeTensionSetCalibrationCommand {
  action: 'spoke_tension_set_calibration'
  side: 'left' | 'right'
  factor: number
}

export interface SpokeTensionStatusCommand {
  action: 'spoke_tension_status'
}

// =======================
// CILINDROS PNEUMATICOS
// =======================

export interface PneumaticCylinderMoveCommand {
  action: 'pneumatic_cylinder_move'
  cylinder:
    | 'spoke_tension_left'
    | 'spoke_tension_right'
    | 'nipple_arm_left'
    | 'nipple_arm_right'
    | 'nipple_lift_left'
    | 'nipple_lift_right'
  position: 'extended' | 'retracted'
}

// =======================
// UNION PRINCIPAL
// =======================

export type MachineCommand =
  | SyncMachineConfigCommand
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
  | SpokeTensionStartCollectionCommand
  | SpokeTensionStopCollectionCommand
  | SpokeTensionTareCommand
  | SpokeTensionSetCalibrationCommand
  | SpokeTensionStatusCommand
  | PneumaticCylinderMoveCommand
