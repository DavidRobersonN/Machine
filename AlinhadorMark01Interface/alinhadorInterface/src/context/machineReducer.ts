import type { MachineAction, MachineState } from '../types/machine'

export const initialMachineState: MachineState = {
  connected: false,
  led: 'Desligado',
}

export function machineReducer(
  state: MachineState,
  action: MachineAction,
): MachineState {
  switch (action.type) {
    case 'SOCKET_CONNECTED':
      return {
        ...state,
        connected: true,
      }

    case 'SOCKET_DISCONNECTED':
      return {
        ...state,
        connected: false,
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
      }

    default:
      return state
  }
}