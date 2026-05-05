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

  function handleIncreaseSpeed() {
    sendCommand({
      action: 'motor_roda_increase_speed',
    })
  }

  function handleDecreaseSpeed() {
    sendCommand({
      action: 'motor_roda_decrease_speed',
    })
  }

  function handleResetPosition() {
    sendCommand({
      action: 'wheel_reset_position',
    })
  }

  return (
    <MotorPassoGenerico
      title="Motor da roda"
      onStart={handleStart}
      onStop={handleStop}
      onClockwise={handleClockwise}
      onCounterClockwise={handleCounterClockwise}
      onIncreaseSpeed={handleIncreaseSpeed}
      onDecreaseSpeed={handleDecreaseSpeed}
      onResetPosition={handleResetPosition}
      clockwiseLabel="Girar horário"
      counterClockwiseLabel="Girar anti-horário"
    />
  )
}