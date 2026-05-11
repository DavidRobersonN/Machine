import './MotorPassoGenerico.css'

type MotorDirection = 'clockwise' | 'counter_clockwise' | 'stopped'

type MotorPassoGenericoProps = {
  title: string
  subtitle?: string

  isRunning?: boolean
  direction?: MotorDirection
  speedPercent?: number

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

function getDirectionLabel(direction?: MotorDirection) {
  if (direction === 'clockwise') {
    return 'Horário'
  }

  if (direction === 'counter_clockwise') {
    return 'Anti-horário'
  }

  return 'Parado'
}

export function MotorPassoGenerico({
  title,
  subtitle = 'Controle manual do motor.',
  isRunning = false,
  direction = 'stopped',
  speedPercent = 0,
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
  const normalizedSpeed = Math.max(0, Math.min(speedPercent, 100))

  return (
    <aside className="motor-passo-generico">
      <header className="motor-passo-generico__header">
        <div>
          <span className="motor-passo-generico__eyebrow">Controle manual</span>

          <h3 className="motor-passo-generico__title">
            ⚙️ {title}
          </h3>

          <p className="motor-passo-generico__subtitle">
            {subtitle}
          </p>
        </div>

        <span
          className={`motor-passo-generico__status ${
            isRunning ? 'is-running' : 'is-stopped'
          }`}
        >
          {isRunning ? 'Em movimento' : 'Parado'}
        </span>
      </header>

      <div className="motor-passo-generico__summary">
        <div className="motor-passo-generico__summary-item">
          <span>Velocidade</span>
          <strong>{normalizedSpeed}%</strong>
        </div>

        <div className="motor-passo-generico__summary-item">
          <span>Sentido</span>
          <strong>{getDirectionLabel(direction)}</strong>
        </div>
      </div>

      <div className="motor-passo-generico__speed-bar">
        <div
          className="motor-passo-generico__speed-fill"
          style={{ width: `${normalizedSpeed}%` }}
        />
      </div>

      <div className="motor-passo-generico__content">
        <section className="motor-passo-generico__section">
          <span className="motor-passo-generico__section-label">
            Ações
          </span>

          <div className="motor-passo-generico__grid motor-passo-generico__grid--2">
            <button
              type="button"
              className="motor-passo-generico__button primary"
              onClick={onStart}
            >
              ▶ Iniciar
            </button>

            <button
              type="button"
              className="motor-passo-generico__button danger"
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
              className="motor-passo-generico__button neutral"
              onClick={onIncreaseSpeed}
            >
              ＋ Aumentar
            </button>

            <button
              type="button"
              className="motor-passo-generico__button neutral"
              onClick={onDecreaseSpeed}
            >
              － Diminuir
            </button>
          </div>
        </section>

        <section className="motor-passo-generico__section">
          <span className="motor-passo-generico__section-label">
            Sentido
          </span>

          <div className="motor-passo-generico__grid">
            <button
              type="button"
              className="motor-passo-generico__button warning"
              onClick={onClockwise}
            >
              ↻ {clockwiseLabel}
            </button>

            <button
              type="button"
              className="motor-passo-generico__button warning"
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
                className="motor-passo-generico__button danger ghost"
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