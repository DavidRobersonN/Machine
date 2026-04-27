import type { LedUiState } from '../../../types/machine/state'
import './LedScreen.css'

type LedScreenProps = {
  led: LedUiState
}

// Este componente é responsável por renderizar a tela visual do LED.
// Ele apenas mostra o estado atual vindo do state global.
export function LedScreen({ led }: LedScreenProps) {
  const isLedOn = led === 'Ligado'

  return (
    <div className="screen-page">
      <h2 className="screen-page-title">Estado do LED</h2>

      <div className="led-screen-content">
        <div className={`lamp-wrapper ${isLedOn ? 'lamp-on' : 'lamp-off'}`}>
          <div className="lamp-glow" />

          <div className="lamp-bulb">
            <div className="lamp-shine" />
          </div>

          <div className="lamp-neck" />
          <div className="lamp-base" />
          <div className="lamp-base-line" />
          <div className="lamp-base-line small" />
        </div>

        <p className={`led-status-text ${isLedOn ? 'on' : 'off'}`}>
          LED {led}
        </p>
      </div>
    </div>
  )
}