import { useMachineContext } from '../../context/MachineContext'

export function useMachineScreenData() {
  const { state } = useMachineContext()

  return {
    logs: state.logs,

    sidebarProps: {
      led: state.led,
      databaseConnection: state.connected ? 'Conectado' : 'Desconectado',
      arduinoConnection: state.arduino_connected,
      extraLabel: 'Estatico',
      extraValue: 'Estatico',
      progressLabel: 'Estatico',
      progressValue: 50,
    },

    statusBarProps: {
      arduinoConnection: state.arduino_connected,
      led: state.led,
    },
  }
}