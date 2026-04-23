import { useMachineContext } from '../../context/MachineContext'

export function useScreenMainData() {
  const { state } = useMachineContext()

  return {
    logs: state.logs,
    led: state.led,
    databaseConnection: state.connected ? 'Conectado' : 'Desconectado',
    arduinoConnection: state.arduino_connected,
    extraLabel: 'Porta COM',
    extraValue: 'COM5',
    progressLabel: 'Progress',
    progressValue: 50,
  }
}