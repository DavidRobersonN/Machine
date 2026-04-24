type MotorPassoGenericoProps = {
  title: string

  onStart: () => void
  onStop: () => void

  onClockwise: () => void
  onCounterClockwise: () => void

  clockwiseLabel: string
  counterClockwiseLabel: string
}

export function MotorPassoGenerico({
  title,
  onStart,
  onStop,
  onClockwise,
  onCounterClockwise,
  clockwiseLabel,
  counterClockwiseLabel,
}: MotorPassoGenericoProps) {
  return (
    <div className="screen-page">
      <h3>{title}</h3>

      <div className="screen-page-actions">
        <button className="btn btn-green" onClick={onStart}>
          Iniciar
        </button>

        <button className="btn btn-red" onClick={onStop}>
          Parar
        </button>
      </div>

      <div className="screen-page">
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