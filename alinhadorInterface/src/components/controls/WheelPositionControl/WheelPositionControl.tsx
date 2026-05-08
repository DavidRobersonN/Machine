import { useMemo, useState } from 'react'
import { useMachineContext } from '../../../context/MachineContext'

import './WheelPositionControl.css'

export function WheelPositionControl() {
  const { state, sendCommand } = useMachineContext()

  const [angleInput, setAngleInput] = useState('0')
  const [spokeInput, setSpokeInput] = useState('1')

  const currentAngle = state.wheel_current_angle
  const targetAngle = state.wheel_target_angle
  const currentSpoke = state.wheel_current_spoke
  const targetSpoke = state.wheel_target_spoke
  const totalSpokes = state.wheel_total_spokes
  const isPositioning = state.wheel_is_positioning

  const degreesPerSpoke = totalSpokes > 0 ? 360 / totalSpokes : 0

  const spokeMarkers = useMemo(() => {
    const safeTotalSpokes = totalSpokes > 0 ? totalSpokes : 36
    const safeDegreesPerSpoke = 360 / safeTotalSpokes

    const center = 100
    const outerRadius = 76
    const innerRadius = 24

    return Array.from({ length: safeTotalSpokes }, (_, index) => {
      const spokeNumber = index + 1

      const angleDegrees = index * safeDegreesPerSpoke - 90
      const angleRadians = (angleDegrees * Math.PI) / 180

      const outerX = center + outerRadius * Math.cos(angleRadians)
      const outerY = center + outerRadius * Math.sin(angleRadians)

      const innerX = center + innerRadius * Math.cos(angleRadians)
      const innerY = center + innerRadius * Math.sin(angleRadians)

      const isCurrentSpoke = spokeNumber === currentSpoke
      const isTargetSpoke = spokeNumber === targetSpoke

      return {
        spokeNumber,
        outerX,
        outerY,
        innerX,
        innerY,
        isCurrentSpoke,
        isTargetSpoke,
      }
    })
  }, [currentSpoke, targetSpoke, totalSpokes])

  function handleSetZero() {
    sendCommand({
      action: 'motor_roda_set_zero',
    })
  }

  function handleGoToAngle() {
    const angle = Number(angleInput)

    if (Number.isNaN(angle)) {
      return
    }

    sendCommand({
      action: 'motor_roda_go_to_angle',
      angle,
    })
  }

  function handleGoToSpoke() {
    const spoke = Number(spokeInput)

    if (Number.isNaN(spoke)) {
      return
    }

    sendCommand({
      action: 'motor_roda_go_to_spoke',
      spoke,
    })
  }

  function handleNextSpoke() {
    sendCommand({
      action: 'motor_roda_next_spoke',
    })
  }

  function handlePreviousSpoke() {
    sendCommand({
      action: 'motor_roda_previous_spoke',
    })
  }

  function handleRequestPositionStatus() {
    sendCommand({
      action: 'motor_roda_position_status',
    })
  }

  return (
    <section className="wheel-position-control">
      <header className="wheel-position-control__header">
        <div>
          <h2>📍 Posição da roda</h2>
          <p>Controle a roda por ângulo ou pelo número do raio.</p>
        </div>

        <span
          className={
            isPositioning
              ? 'wheel-position-control__status wheel-position-control__status--moving'
              : 'wheel-position-control__status wheel-position-control__status--stopped'
          }
        >
          {isPositioning ? 'Movendo' : 'Posicionado'}
        </span>
      </header>

      <div className="wheel-position-control__layout">
        <div className="wheel-position-control__panel">
          <div className="wheel-position-control__summary">
            <div className="wheel-position-control__card">
              <span className="wheel-position-control__label">
                Ângulo atual
              </span>
              <strong>{currentAngle.toFixed(2)}°</strong>
            </div>

            <div className="wheel-position-control__card">
              <span className="wheel-position-control__label">
                Raio atual
              </span>
              <strong>
                {currentSpoke} / {totalSpokes}
              </strong>
            </div>

            <div className="wheel-position-control__card">
              <span className="wheel-position-control__label">Alvo</span>
              <strong>
                {targetAngle !== null ? `${targetAngle.toFixed(2)}°` : '-'}
              </strong>
              <small>
                {targetSpoke !== null ? `Raio ${targetSpoke}` : 'Sem alvo'}
              </small>
            </div>
          </div>

          <div className="wheel-position-control__actions">
            <button
              type="button"
              className="wheel-position-control__button wheel-position-control__button--primary"
              onClick={handleSetZero}
            >
              🎯 Definir zero
            </button>

            <button
              type="button"
              className="wheel-position-control__button"
              onClick={handlePreviousSpoke}
            >
              ⬅️ Raio anterior
            </button>

            <button
              type="button"
              className="wheel-position-control__button"
              onClick={handleNextSpoke}
            >
              Próximo raio ➡️
            </button>

            <button
              type="button"
              className="wheel-position-control__button"
              onClick={handleRequestPositionStatus}
            >
              🔄 Atualizar status
            </button>
          </div>

          <div className="wheel-position-control__forms">
            <div className="wheel-position-control__form-card">
              <label htmlFor="wheel-angle-input">Ir para ângulo</label>

              <div className="wheel-position-control__input-row">
                <input
                  id="wheel-angle-input"
                  type="number"
                  value={angleInput}
                  min={0}
                  max={359}
                  onChange={(event) => setAngleInput(event.target.value)}
                />

                <span>°</span>

                <button type="button" onClick={handleGoToAngle}>
                  Ir
                </button>
              </div>

              <small>Informe um ângulo entre 0° e 359°.</small>
            </div>

            <div className="wheel-position-control__form-card">
              <label htmlFor="wheel-spoke-input">Ir para raio</label>

              <div className="wheel-position-control__input-row">
                <input
                  id="wheel-spoke-input"
                  type="number"
                  value={spokeInput}
                  min={1}
                  max={totalSpokes}
                  onChange={(event) => setSpokeInput(event.target.value)}
                />

                <button type="button" onClick={handleGoToSpoke}>
                  Ir para raio
                </button>
              </div>

              <small>Informe um raio entre 1 e {totalSpokes}.</small>
            </div>
          </div>

          <footer className="wheel-position-control__info">
            ℹ️ {totalSpokes} raios • {degreesPerSpoke.toFixed(2)}° por raio
          </footer>
        </div>

        <div className="wheel-position-control__wheel-preview">
          <div className="wheel-position-control__wheel-header">
            <span>Visual da roda</span>
            <strong>{currentSpoke}</strong>
          </div>

          <svg
            className="wheel-position-control__wheel-svg"
            viewBox="0 0 200 200"
            role="img"
            aria-label={`Roda com ${totalSpokes} raios. Raio atual ${currentSpoke}.`}
          >
            <circle
              className="wheel-position-control__wheel-outer"
              cx="100"
              cy="100"
              r="76"
            />

            <circle
              className="wheel-position-control__wheel-inner"
              cx="100"
              cy="100"
              r="24"
            />

            {spokeMarkers.map((marker) => (
              <line
                key={`line-${marker.spokeNumber}`}
                className={
                  marker.isCurrentSpoke
                    ? 'wheel-position-control__wheel-spoke wheel-position-control__wheel-spoke--current'
                    : marker.isTargetSpoke
                      ? 'wheel-position-control__wheel-spoke wheel-position-control__wheel-spoke--target'
                      : 'wheel-position-control__wheel-spoke'
                }
                x1={marker.innerX}
                y1={marker.innerY}
                x2={marker.outerX}
                y2={marker.outerY}
              />
            ))}

            {spokeMarkers.map((marker) => (
              <circle
                key={`marker-${marker.spokeNumber}`}
                className={
                  marker.isCurrentSpoke
                    ? 'wheel-position-control__wheel-marker wheel-position-control__wheel-marker--current'
                    : marker.isTargetSpoke
                      ? 'wheel-position-control__wheel-marker wheel-position-control__wheel-marker--target'
                      : 'wheel-position-control__wheel-marker'
                }
                cx={marker.outerX}
                cy={marker.outerY}
                r={marker.isCurrentSpoke ? 5 : 3}
              />
            ))}

            <text
              className="wheel-position-control__wheel-angle-label"
              x="100"
              y="12"
              textAnchor="middle"
            >
              0°
            </text>

            <text
              className="wheel-position-control__wheel-angle-label"
              x="188"
              y="104"
              textAnchor="middle"
            >
              90°
            </text>

            <text
              className="wheel-position-control__wheel-angle-label"
              x="100"
              y="196"
              textAnchor="middle"
            >
              180°
            </text>

            <text
              className="wheel-position-control__wheel-angle-label"
              x="12"
              y="104"
              textAnchor="middle"
            >
              270°
            </text>

            <text
              className="wheel-position-control__wheel-current-label"
              x="147"
              y="94"
            >
              {currentSpoke}
            </text>
          </svg>

          <div className="wheel-position-control__wheel-legend">
            <span>
              <i className="wheel-position-control__legend-dot wheel-position-control__legend-dot--current" />
              Raio atual
            </span>

            <span>
              <i className="wheel-position-control__legend-dot wheel-position-control__legend-dot--target" />
              Raio alvo
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}