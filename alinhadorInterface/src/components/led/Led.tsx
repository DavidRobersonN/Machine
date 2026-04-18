import { useMachineContext } from '../../context/MachineContext'

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
      <button className="btn btn-green" onClick={handleTurnLedOn}>
        Ligar
      </button>

      <button className="btn btn-green" onClick={handleTurnLedOff}>
        Desligar
      </button>
    </>
  )
}