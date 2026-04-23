import { LedControl } from '../PainelComponents/led/LedControl'

type LedScreenProps = {
  onBack: () => void
}

export function LedScreen({ onBack }: LedScreenProps) {
  return (
    <div className="screen-page">
      <h2 className="screen-page-title">Controle do LED</h2>

      <LedControl />

      <div className="screen-page-actions">
        <button className="btn btn-orange" onClick={onBack}>
          Voltar para o menu
        </button>
      </div>
    </div>
  )
}