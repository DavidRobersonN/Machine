// Responsavel pela actions internas do Reducer, ou seja, as ações que o 
// reducer pode executar para atualizar o estado global da aplicação.

import type {
  MachineLog,
  SelectedSerialPortState,
  SerialPortInfo,
} from './state'

import type { MachineUpdatePayload } from './messages'

export type MachineAction =
  | { type: 'SOCKET_CONNECTED' }
  | { type: 'SOCKET_DISCONNECTED' }
  | { type: 'MACHINE_UPDATED'; payload: MachineUpdatePayload }
  | { type: 'ADD_LOG'; payload: MachineLog }
  | { type: 'CLEAR_LOGS' }
  | { type: 'SET_AVAILABLE_PORTS'; payload: SerialPortInfo[] }
  | { type: 'SET_SELECTED_PORT'; payload: SelectedSerialPortState }
  | { type: 'SET_SPEED_MOTOR_RODA'; payload: number }