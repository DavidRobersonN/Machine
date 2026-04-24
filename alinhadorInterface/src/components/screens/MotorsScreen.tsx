import { MotorRodaControl } from '../PainelComponents/Motors/MotorRodaControl'
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
      <div className="motors-screen-content">
        <MotorRodaControl />
      </div>
    </div>
  )
}