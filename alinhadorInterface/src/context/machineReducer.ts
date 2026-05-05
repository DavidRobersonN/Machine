import type { MachineAction, MachineState } from '../types/machine/machine'

// O reducer é uma função pura que recebe o estado atual e uma ação,
// e retorna um novo estado atualizado com base na ação recebida.

// Estado inicial da máquina
export const initialMachineState: MachineState = {
  connected: false,
  led: 'Desligado',
  arduino_connected: 'Desconectado',
  logs: [],
  available_ports: [],
  selected_port: null,
  speed_motor_roda: 0,

  wheel_position_degrees: 0,
  wheel_total_turns: 0,
  wheel_direction: 'stopped',
  wheel_is_running: false,
  motor_turns_per_wheel_turn: 1,

  lateral_misalignment_current: 0,
  lateral_misalignment_history: [],
  is_lateral_reading_enabled: false,
}

export function machineReducer(
  state: MachineState,
  action: MachineAction,
): MachineState {
  switch (action.type) {
    case 'SET_LATERAL_MISALIGNMENT_CURRENT':
      return {
        ...state,
        lateral_misalignment_current: action.payload,
      }

    case 'ADD_LATERAL_MISALIGNMENT_POINT': {
      const newPoint = {
        id: Date.now(),
        value: action.payload,
      }

      const updatedHistory = [
        ...state.lateral_misalignment_history,
        newPoint,
      ].slice(-100)

      return {
        ...state,
        lateral_misalignment_history: updatedHistory,
      }
    }

    case 'SET_SELECTED_PORT':
      return {
        ...state,
        selected_port: action.payload,
      }

    case 'SOCKET_CONNECTED':
      return {
        ...state,
        connected: true,
      }

    case 'SET_AVAILABLE_PORTS':
      return {
        ...state,
        available_ports: action.payload,
      }

    case 'SOCKET_DISCONNECTED':
      return {
        ...state,
        connected: false,
        arduino_connected: 'Desconectado',
      }

    case 'ADD_LOG':
      return {
        ...state,
        logs: [...state.logs, action.payload].slice(-30),
      }

    case 'CLEAR_LOGS':
      return {
        ...state,
        logs: [],
      }

    case 'SET_SPEED_MOTOR_RODA':
      return {
        ...state,
        speed_motor_roda: action.payload,
      }

    case 'MACHINE_UPDATED': {
      const lateralValue = action.payload.lateral_misalignment_current

      return {
        ...state,

        led:
          action.payload.led === 'ON'
            ? 'Ligado'
            : action.payload.led === 'OFF'
              ? 'Desligado'
              : state.led,

        arduino_connected:
          action.payload.arduino_connected === true
            ? 'Conectado'
            : action.payload.arduino_connected === false
              ? 'Desconectado'
              : state.arduino_connected,

        selected_port:
          action.payload.selected_port !== undefined
            ? action.payload.selected_port
            : state.selected_port,

        speed_motor_roda:
          action.payload.speed_motor_roda !== undefined
            ? action.payload.speed_motor_roda
            : state.speed_motor_roda,
        
                    wheel_position_degrees:
          action.payload.wheel_position_degrees !== undefined
            ? action.payload.wheel_position_degrees
            : state.wheel_position_degrees,

        wheel_total_turns:
          action.payload.wheel_total_turns !== undefined
            ? action.payload.wheel_total_turns
            : state.wheel_total_turns,

        wheel_direction:
          action.payload.wheel_direction !== undefined
            ? action.payload.wheel_direction
            : state.wheel_direction,

        wheel_is_running:
          action.payload.wheel_is_running !== undefined
            ? action.payload.wheel_is_running
            : state.wheel_is_running,

        motor_turns_per_wheel_turn:
          action.payload.motor_turns_per_wheel_turn !== undefined
            ? action.payload.motor_turns_per_wheel_turn
            : state.motor_turns_per_wheel_turn,

        lateral_misalignment_current:
          lateralValue !== undefined
            ? lateralValue
            : state.lateral_misalignment_current,

        // O histórico agora é atualizado pela action ADD_LATERAL_MISALIGNMENT_POINT.
        // Isso evita adicionar ponto duplicado toda vez que chega machine_update.
        lateral_misalignment_history: state.lateral_misalignment_history,

        is_lateral_reading_enabled:
          action.payload.is_lateral_reading_enabled !== undefined
          ? action.payload.is_lateral_reading_enabled
          : state.is_lateral_reading_enabled,
      }
    }

    default:
      return state
  }
}