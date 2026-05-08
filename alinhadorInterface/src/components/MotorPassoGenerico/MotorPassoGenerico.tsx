import './MotorPassoGenerico.css'

type MotorPassoGenericoProps = {
  title: string

  onStart: () => void
  onStop: () => void

  onClockwise: () => void
  onCounterClockwise: () => void

  onIncreaseSpeed: () => void
  onDecreaseSpeed: () => void

  onResetPosition?: () => void

  clockwiseLabel: string
  counterClockwiseLabel: string
}

export function MotorPassoGenerico({
  title,
  onStart,
  onStop,
  onClockwise,
  onCounterClockwise,
  onIncreaseSpeed,
  onDecreaseSpeed,
  onResetPosition,
  clockwiseLabel,
  counterClockwiseLabel,
}: MotorPassoGenericoProps) {
  return (
    <aside className="motor-passo-generico">
      <header className="motor-passo-generico__header">
        <h3 className="motor-passo-generico__title">⚙️ {title}</h3>
        <p className="motor-passo-generico__subtitle">
          Controle manual do motor da roda.
        </p>
      </header>

      <div className="motor-passo-generico__content">
        <section className="motor-passo-generico__section">
          <span className="motor-passo-generico__section-label">
            Ações principais
          </span>

          <div className="motor-passo-generico__grid motor-passo-generico__grid--2">
            <button
              type="button"
              className="btn btn-green motor-passo-generico__button"
              onClick={onStart}
            >
              ▶ Iniciar
            </button>

            <button
              type="button"
              className="btn btn-red motor-passo-generico__button"
              onClick={onStop}
            >
              ■ Parar
            </button>
          </div>
        </section>

        <section className="motor-passo-generico__section">
          <span className="motor-passo-generico__section-label">
            Velocidade
          </span>

          <div className="motor-passo-generico__grid">
            <button
              type="button"
              className="btn btn-blue motor-passo-generico__button"
              onClick={onIncreaseSpeed}
            >
              ＋ Aumentar velocidade
            </button>

            <button
              type="button"
              className="btn btn-blue motor-passo-generico__button"
              onClick={onDecreaseSpeed}
            >
              － Diminuir velocidade
            </button>
          </div>
        </section>

        <section className="motor-passo-generico__section">
          <span className="motor-passo-generico__section-label">Sentido</span>

          <div className="motor-passo-generico__grid">
            <button
              type="button"
              className="btn btn-orange motor-passo-generico__button"
              onClick={onClockwise}
            >
              ↻ {clockwiseLabel}
            </button>

            <button
              type="button"
              className="btn btn-orange motor-passo-generico__button"
              onClick={onCounterClockwise}
            >
              ↺ {counterClockwiseLabel}
            </button>
          </div>
        </section>

        {onResetPosition && (
          <section className="motor-passo-generico__section">
            <span className="motor-passo-generico__section-label">
              Referência
            </span>

            <div className="motor-passo-generico__grid">
              <button
                type="button"
                className="btn btn-red motor-passo-generico__button motor-passo-generico__button--danger"
                onClick={onResetPosition}
              >
                🎯 Zerar posição
              </button>
            </div>
          </section>
        )}
      </div>
    </aside>
  )
}