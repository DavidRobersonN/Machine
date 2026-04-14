import { useMachineContext } from '../../context/MachineContext'

export function LedPanel() {
  const { state, sendCommand } = useMachineContext()

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
    <section>
      <h2>LED</h2>

      <p>Conexão: {state.connected ? 'Conectado' : 'Desconectado'}</p>
      <p>Estado do LED: {state.led}</p>

      <button onClick={handleTurnLedOn}>Ligar LED</button>
      <button onClick={handleTurnLedOff}>Desligar LED</button>
    </section>
  )
}