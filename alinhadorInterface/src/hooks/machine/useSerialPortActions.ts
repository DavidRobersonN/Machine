import { useMachineContext } from '../../context/MachineContext'

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