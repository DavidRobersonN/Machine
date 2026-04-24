import { useMachineContext } from '../../../context/MachineContext'
import { MotorPassoGenerico } from '../../MotorPassoGenerico/MotorPassoGenerico'

export function MotorRodaControl() {
  const { sendCommand } = useMachineContext()

  function handleStart() {
    sendCommand({
      action: 'motor_roda_start',
    })
  }

  function handleStop() {
    sendCommand({
      action: 'motor_roda_stop',
    })
  }

  function handleClockwise() {
    sendCommand({
      action: 'motor_roda_set_clockwise',
    })
  }

  function handleCounterClockwise() {
    sendCommand({
      action: 'motor_roda_set_counter_clockwise',
    })
  }

  return (
    <MotorPassoGenerico
      title="Motor da roda"
      onStart={handleStart}
      onStop={handleStop}
      onClockwise={handleClockwise}
      onCounterClockwise={handleCounterClockwise}
      clockwiseLabel="Girar horário"
      counterClockwiseLabel="Girar anti-horário"
    />
  )
}