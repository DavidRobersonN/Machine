import { MotorRodaControl } from '../PainelComponents/Motors/MotorRodaControl'

export function MotorsScreen() {
  return (
    <div className="screen-page">
      <h2 className="screen-page-title">Motores</h2>

      <div className="motors-screen-content">
        <MotorRodaControl />
      </div>
    </div>
  )
}