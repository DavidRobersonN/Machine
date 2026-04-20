import { useMachineContext } from '../../context/MachineContext'
import { BotaoRedondoVermelho } from '../Botao/BotaoRedondoVermelho'

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
      <BotaoRedondoVermelho
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