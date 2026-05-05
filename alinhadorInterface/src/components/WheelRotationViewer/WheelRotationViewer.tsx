import type { WheelDirection } from '../../types/machine'

import './WheelRotationViewer.css'

type WheelRotationViewerProps = {
  positionDegrees: number
  totalTurns: number
  speedPercent: number
  direction: WheelDirection
  isRunning: boolean
  motorTurnsPerWheelTurn: number
}

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360
}

function getDirectionLabel(direction: WheelDirection) {
  if (direction === 'clockwise') {
    return 'Horário'
  }

  if (direction === 'counter_clockwise') {
    return 'Anti-horário'
  }

  return 'Parado'
}

export function WheelRotationViewer({
  positionDegrees,
  totalTurns,
  speedPercent,
  direction,
  isRunning,
  motorTurnsPerWheelTurn,
}: WheelRotationViewerProps) {
  const safeSpeed = Math.min(100, Math.max(0, speedPercent))

  /*
    A posição exibida fica sempre entre 0 e 359 graus.
    Isso é bom para mostrar no card.
  */
  const normalizedPosition = normalizeDegrees(positionDegrees)

  /*
    A rotação visual usa totalTurns * 360.

    Isso evita o problema de quando a posição volta de 359 para 0.
    Se usássemos só positionDegrees, a roda poderia parecer voltar para trás.

    Exemplo:
    totalTurns = 1   => 360 graus => 1 volta completa
    totalTurns = 2   => 720 graus => 2 voltas completas
    totalTurns = 0.5 => 180 graus => meia volta
  */
  const visualRotationDegrees = totalTurns * 360

  return (
    <div className="wheel-viewer">
      <div className="wheel-viewer-header">
        <p className="wheel-viewer-title">Roda</p>

        <span
          className={
            isRunning
              ? 'wheel-viewer-status is-running'
              : 'wheel-viewer-status is-stopped'
          }
        >
          {isRunning ? 'Girando' : 'Parada'}
        </span>
      </div>

      <div className="wheel-stage">
        <div
          className="wheel"
          style={{
            transform: `rotate(${visualRotationDegrees}deg)`,
          }}
          aria-label={`Roda na posição ${normalizedPosition.toFixed(
            0,
          )} graus`}
        >
          <div className="wheel-rim" />

          <div className="wheel-spokes">
            <span className="wheel-spoke wheel-spoke-1" />
            <span className="wheel-spoke wheel-spoke-2" />
            <span className="wheel-spoke wheel-spoke-3" />
            <span className="wheel-spoke wheel-spoke-4" />
            <span className="wheel-spoke wheel-spoke-5" />
            <span className="wheel-spoke wheel-spoke-6" />
          </div>

          <div className="wheel-hub" />

          <span className="wheel-position-marker" />
        </div>
      </div>

      <div className="wheel-info-grid">
        <div className="wheel-info-card">
          <span>Posição</span>
          <strong>{normalizedPosition.toFixed(0)}°</strong>
        </div>

        <div className="wheel-info-card">
          <span>Voltas</span>
          <strong>{totalTurns.toFixed(2)}</strong>
        </div>

        <div className="wheel-info-card">
          <span>Sentido</span>
          <strong>{getDirectionLabel(direction)}</strong>
        </div>

        <div className="wheel-info-card">
          <span>Velocidade</span>
          <strong>{safeSpeed}%</strong>
        </div>

        <div className="wheel-info-card">
          <span>Relação</span>
          <strong>{motorTurnsPerWheelTurn}:1</strong>
        </div>
      </div>
    </div>
  )
}