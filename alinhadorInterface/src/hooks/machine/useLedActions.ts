import { useMachineContext } from '../../context/MachineContext'

export function useLedActions() {
  const { sendCommand } = useMachineContext()

  function turnLedOn() {
    sendCommand({
      action: 'led_on',
    })
  }

  function turnLedOff() {
    sendCommand({
      action: 'led_off',
    })
  }

  return {
    turnLedOn,
    turnLedOff,
  }
}