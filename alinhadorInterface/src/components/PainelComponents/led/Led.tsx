import { useMachineContext } from '../../../context/MachineContext'
import { BotaoRedondoVermelho } from '../../Botao/BotaoRedondoVermelho'
import { BotaoQuadradoVerde } from '../../Botao/BotaoQuadradoVerde'

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
    <div className="led-buttons">
      <BotaoQuadradoVerde
        nome="Ligar"
        onClick={handleTurnLedOn}
      />

      <BotaoRedondoVermelho
        nome="Desligar"
        onClick={handleTurnLedOff}
      />
    </div>
  )
}