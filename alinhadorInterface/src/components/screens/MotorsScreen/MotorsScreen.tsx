import { WheelPositionControl } from '../../../components/controls/WheelPositionControl/WheelPositionControl'

import './MotorsScreen.css'

export function MotorsScreen() {
  return (
    <div className="screen-page motors-screen">
      <header className="motors-screen__header">
        <div>
          <h2 className="screen-page-title">Motores</h2>
          <p>Controle de posição e movimentação da roda.</p>
        </div>
      </header>

      <div className="motors-dashboard-area">
        <WheelPositionControl />
      </div>
    </div>
  )
}