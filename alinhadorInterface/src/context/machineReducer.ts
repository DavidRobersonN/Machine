import type { MachineAction, MachineState } from '../types/machine/machine'

/// O reducer é uma função pura que recebe o estado atual e uma ação, e 
// retorna um novo estado atualizado com base na ação recebida. Ele é usado para gerenciar o estado global da aplicação de forma previsível e eficiente.

// O estado inicial da máquina, que é usado para inicializar o estado global da aplicação. Ele define os valores padrão para todas as propriedades do estado, 
// garantindo que a aplicação tenha um estado consistente desde o início.
export const initialMachineState: MachineState = {
  connected: false,
  led: 'Desligado',
  arduino_connected: 'Desconectado',
  logs: [],
  available_ports: [],
  selected_port: null,
  speed_motor_roda: 0,
  lateral_misalignment_current: 0,
  lateral_misalignment_history: [],
}


// esses case, vem do backend. O backend envia mensagens do tipo MachineMessage, e o reducer atualiza o estado global da aplicação
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

    case 'MACHINE_UPDATED':
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
      }

    default:
      return state
  }
}