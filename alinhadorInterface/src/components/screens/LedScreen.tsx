import { LedControl } from '../PainelComponents/led/LedControl'

export function LedScreen( ) {
  return (
    <div className="screen-page">
      <h2 className="screen-page-title">Controle do LED</h2>

      <LedControl />
    </div>
  )
}