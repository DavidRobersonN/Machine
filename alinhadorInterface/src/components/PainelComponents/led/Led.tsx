import { useMachineContext } from '../../../context/MachineContext'
import { BotaoRedondoVermelho } from '../../BotoesGenericos/BotaoRedondoVermelho'
import { BotaoRedondoVerde } from '../../BotoesGenericos/BotaoRedondoVerde'

export function Led() {
  const { sendCommand } = useMachineContext()

  function handleTurnLedOn() {
    sendCommand({
      action: 'led_on',
    })
  }

  function handleTurnLedOff() {
    sendCommand({
      action: 'led_off',
    })
  }

  return (
    <>
      <BotaoRedondoVerde
        nome="Ligar"
        onClick={handleTurnLedOn}
      />

      <BotaoRedondoVermelho
        nome="Desligar"
        onClick={handleTurnLedOff}
      />
    </>
  )
}