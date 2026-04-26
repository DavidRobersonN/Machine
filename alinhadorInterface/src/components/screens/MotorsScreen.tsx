import { SpeedGauge } from '../SpeedGauge/SpeedGauge'

type MotorsScreenProps = {
  speedPercent: number
}

export function MotorsScreen({ speedPercent }: MotorsScreenProps) {
  return (
    <div className="screen-page">
      <h2 className="screen-page-title">Motores</h2>

      <div className="screen-main-right">
        <SpeedGauge value={speedPercent} />
      </div>
    </div>
  )
}