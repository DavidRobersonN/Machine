import { memo } from 'react'

import { WheelPositionControl } from '../../../components/controls/WheelPositionControl/WheelPositionControl'
import { MotorRodaControl } from '../../PainelComponents/Motors/MotorRodaControl'

import './MotorsScreen.css'

function MotorsScreenComponent() {
  return (
    <div className="screen-page motors-screen">
      <header className="motors-screen__header">
        <div>
          <h2 className="screen-page-title">Motores</h2>
          <p>Controle de posição e movimentação da roda.</p>
        </div>
      </header>

      <div className="motors-screen-layout">
        <div className="motors-dashboard-area">
          <WheelPositionControl />
        </div>

        <div className="motors-control-bottom-area">
          <MotorRodaControl />
        </div>
      </div>
    </div>
  )
}

export const MotorsScreen = memo(MotorsScreenComponent)