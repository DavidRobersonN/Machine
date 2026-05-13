import { useMachineContext } from '../../context/useMachineContext'

export function useSerialPortActions() {
  const { sendCommand } = useMachineContext()

  function listAvailableSerialPorts() {
    sendCommand({
      action: 'list_serial_ports',
    })
  }

  return {
    listAvailableSerialPorts,
  }
}
