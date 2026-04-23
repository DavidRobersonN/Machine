import { ToggleControl } from '../../controls/ToggleControl/ToggleControl'
import { useLedActions } from '../../../hooks/machine/useLedActions'

export function LedControl() {
  const { turnLedOn, turnLedOff } = useLedActions()

  return (
    <ToggleControl
      onAction={turnLedOn}
      offAction={turnLedOff}
      onLabel="Ligar"
      offLabel="Desligar"
    />
  )
}