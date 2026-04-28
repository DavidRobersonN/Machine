import './MotorPassoGenerico.css'

type MotorPassoGenericoProps = {
  title: string

  onStart: () => void
  onStop: () => void

  onClockwise: () => void
  onCounterClockwise: () => void

  onIncreaseSpeed: () => void
  onDecreaseSpeed: () => void

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
  clockwiseLabel,
  counterClockwiseLabel,
}: MotorPassoGenericoProps) {
  return (
    <div className="motor-passo-generico">
      <h3 className="motor-passo-title">{title}</h3>

      <div className="motor-passo-actions-row">
        <button className="btn btn-green" onClick={onStart}>
          Iniciar
        </button>

        <button className="btn btn-red" onClick={onStop}>
          Parar
        </button>
      </div>

      <div className="motor-passo-actions-column">
        <button className="btn btn-blue" onClick={onIncreaseSpeed}>
          Aumentar Velocidade
        </button>

        <button className="btn btn-blue" onClick={onDecreaseSpeed}>
          Diminuir Velocidade
        </button>

        <button className="btn btn-orange" onClick={onClockwise}>
          {clockwiseLabel}
        </button>

        <button className="btn btn-orange" onClick={onCounterClockwise}>
          {counterClockwiseLabel}
        </button>
      </div>
    </div>
  )
}