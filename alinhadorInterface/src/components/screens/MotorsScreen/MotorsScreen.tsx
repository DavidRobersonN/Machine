import { SpeedGauge } from '../../../components/SpeedGauge/SpeedGauge'
import { WheelRotationViewer } from '../../../components/WheelRotationViewer/WheelRotationViewer'

import type { WheelDirection } from '../../../types/machine'

import './MotorsScreen.css'

type MotorsScreenProps = {
  speedPercent: number
  wheelPositionDegrees: number
  wheelTotalTurns: number
  wheelDirection: WheelDirection
  wheelIsRunning: boolean
  motorTurnsPerWheelTurn: number
}

export function MotorsScreen({
  speedPercent,
  wheelPositionDegrees,
  wheelTotalTurns,
  wheelDirection,
  wheelIsRunning,
  motorTurnsPerWheelTurn,
}: MotorsScreenProps) {
  return (
    <div className="screen-page motors-screen">
      <h2 className="screen-page-title">Motores</h2>

      <div className="motors-dashboard-area">
        <div className="motors-wheel-area">
          <WheelRotationViewer
            positionDegrees={wheelPositionDegrees}
            totalTurns={wheelTotalTurns}
            speedPercent={speedPercent}
            direction={wheelDirection}
            isRunning={wheelIsRunning}
            motorTurnsPerWheelTurn={motorTurnsPerWheelTurn}
          />
        </div>

        <div className="motors-speed-area">
          <SpeedGauge value={speedPercent} />
        </div>
      </div>
    </div>
  )
}