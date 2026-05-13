import { useMachineContext } from '../../context/useMachineContext'

export function useMachineScreenData() {
  const { state } = useMachineContext()

  return {
    logs: state.logs,
    availablePorts: state.available_ports,
    selectedPort: state.selected_port,

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
