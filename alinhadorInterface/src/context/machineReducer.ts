import type { MachineAction, MachineState } from '../types/machine/machine'
import { angleToSpoke } from '../utils/wheelReference'

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

  wheel_current_angle: 0,
  wheel_target_angle: null,
  wheel_current_spoke: 1,
  wheel_target_spoke: null,
  wheel_total_spokes: 36,
  wheel_is_positioning: false,

  lateral_misalignment_current: 0,
  lateral_misalignment_history: [],
  is_lateral_reading_enabled: false,

  spoke_tension_left_kg: 0,
  spoke_tension_right_kg: 0,
  is_spoke_tension_collecting: false,
}

function addLateralMisalignmentPoint(
  history: MachineState['lateral_misalignment_history'],
  value: number,
) {
  const newPoint = {
    id: Date.now(),
    value,
  }

  return [
    ...history,
    newPoint,
  ].slice(-100)
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
      return {
        ...state,
        lateral_misalignment_history: addLateralMisalignmentPoint(
          state.lateral_misalignment_history,
          action.payload,
        ),
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
      const wheelPositionDegrees = action.payload.wheel_position_degrees
      const wheelCurrentAngle =
        action.payload.wheel_current_angle !== undefined
          ? action.payload.wheel_current_angle
          : wheelPositionDegrees
      const wheelTotalSpokes =
        action.payload.wheel_total_spokes !== undefined
          ? action.payload.wheel_total_spokes
          : state.wheel_total_spokes
      const wheelCurrentSpoke =
        action.payload.wheel_current_spoke !== undefined
          ? action.payload.wheel_current_spoke
          : wheelCurrentAngle !== undefined
            ? angleToSpoke(wheelCurrentAngle, wheelTotalSpokes)
            : undefined

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
          wheelPositionDegrees !== undefined
            ? wheelPositionDegrees
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

        wheel_current_angle:
          wheelCurrentAngle !== undefined
            ? wheelCurrentAngle
            : state.wheel_current_angle,

        wheel_target_angle:
          action.payload.wheel_target_angle !== undefined
            ? action.payload.wheel_target_angle
            : state.wheel_target_angle,

        wheel_current_spoke:
          wheelCurrentSpoke !== undefined
            ? wheelCurrentSpoke
            : state.wheel_current_spoke,

        wheel_target_spoke:
          action.payload.wheel_target_spoke !== undefined
            ? action.payload.wheel_target_spoke
            : state.wheel_target_spoke,

        wheel_total_spokes:
          wheelTotalSpokes !== undefined
            ? wheelTotalSpokes
            : state.wheel_total_spokes,

        wheel_is_positioning:
          action.payload.wheel_is_positioning !== undefined
            ? action.payload.wheel_is_positioning
            : state.wheel_is_positioning,

        lateral_misalignment_current:
          lateralValue !== undefined
            ? lateralValue
            : state.lateral_misalignment_current,

        lateral_misalignment_history:
          lateralValue !== undefined
            ? addLateralMisalignmentPoint(
                state.lateral_misalignment_history,
                lateralValue,
              )
            : state.lateral_misalignment_history,

        is_lateral_reading_enabled:
          action.payload.is_lateral_reading_enabled !== undefined
            ? action.payload.is_lateral_reading_enabled
            : state.is_lateral_reading_enabled,

        spoke_tension_left_kg:
          action.payload.spoke_tension_left_kg !== undefined
            ? action.payload.spoke_tension_left_kg
            : state.spoke_tension_left_kg,

        spoke_tension_right_kg:
          action.payload.spoke_tension_right_kg !== undefined
            ? action.payload.spoke_tension_right_kg
            : state.spoke_tension_right_kg,

        is_spoke_tension_collecting:
          action.payload.is_spoke_tension_collecting !== undefined
            ? action.payload.is_spoke_tension_collecting
            : state.is_spoke_tension_collecting,
      }
    }

    default:
      return state
  }
}
