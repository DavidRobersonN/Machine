import { useCallback } from 'react'
import { useMachineContext } from '../../../context/MachineContext'
import { ToggleControl } from '../../controls/ToggleControl/ToggleControl'

export function LateralAlignmentControl() {
  const { sendCommand } = useMachineContext()

  const handleStartLateralReading = useCallback(() => {
    sendCommand({
      action: 'lateral_sensor_start_reading',
    })
  }, [sendCommand])

  const handleStopLateralReading = useCallback(() => {
    sendCommand({
      action: 'lateral_sensor_stop_reading',
    })
  }, [sendCommand])

  return (
    <ToggleControl
      onAction={handleStartLateralReading}
      offAction={handleStopLateralReading}
      onLabel="Iniciar leitura"
      offLabel="Parar leitura"
    />
  )
}