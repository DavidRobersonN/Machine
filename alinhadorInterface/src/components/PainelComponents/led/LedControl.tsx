import { ToggleControl } from '../../controls/ToggleControl/ToggleControl'
import { useMachineContext } from '../../../context/MachineContext'

export function LedControl() {
  const { sendCommand } = useMachineContext()

  function turnLedOn() {
    console.log('[LedControl] Clicou em LIGAR')

    sendCommand({
      action: 'led_on',
    })
  }

  function turnLedOff() {
    console.log('[LedControl] Clicou em DESLIGAR')

    sendCommand({
      action: 'led_off',
    })
  }

  return (
    <ToggleControl
      onAction={turnLedOn}
      offAction={turnLedOff}
      onLabel="Ligar"
      offLabel="Desligar"
    />
  )
}