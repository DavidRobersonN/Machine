import { SpeedGauge } from '../../../components/SpeedGauge/SpeedGauge'

import './MotorsScreen.css'

type MotorsScreenProps = {
  speedPercent: number
}

export function MotorsScreen({ speedPercent }: MotorsScreenProps) {
  return (
    <div className="screen-page motors-screen">
      <h2 className="screen-page-title">Motores</h2>

      <div className="motors-speed-area">
        <SpeedGauge value={speedPercent} />
      </div>
    </div>
  )
}