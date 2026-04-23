import { useMachineContext } from '../../context/MachineContext'

export function useScreenMainData() {
  const { state } = useMachineContext()

  return {
    logs: state.logs,
    led: state.led,
    databaseConnection: state.connected ? 'Conectado' : 'Desconectado',
    arduinoConnection: state.arduino_connected,
    extraLabel: 'Estatico',
    extraValue: 'Estatico',
    progressLabel: 'Estatico',
    progressValue: 50,
  }
}