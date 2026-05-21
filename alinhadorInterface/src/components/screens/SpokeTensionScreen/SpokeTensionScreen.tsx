import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useMachineContext } from '../../../context/useMachineContext'
import {
  getWheelReferenceAngle,
  getWheelVisualRotationDegrees,
} from '../../../utils/wheelReference'

import './SpokeTensionScreen.css'

type TensionPoint = {
  id: number
  referenceSpoke: number
  leftSpokes: [number, number]
  rightSpokes: [number, number]
  angle: number
  leftKg: number
  rightKg: number
}

function formatKg(value: number) {
  return `${value.toFixed(2)} kg`
}

function getWrappedSpoke(spoke: number, totalSpokes: number) {
  return ((spoke - 1) % totalSpokes + totalSpokes) % totalSpokes + 1
}

function formatPair(pair: [number, number]) {
  return `${pair[0]} e ${pair[1]}`
}

export function SpokeTensionScreen() {
  const { state, sendCommand } = useMachineContext()
  const [points, setPoints] = useState<TensionPoint[]>([])
  const [leftCalibrationFactor, setLeftCalibrationFactor] = useState('1')
  const [rightCalibrationFactor, setRightCalibrationFactor] = useState('1')
  const [isCollecting, setIsCollecting] = useState(false)
  const lastCapturedSpokeRef = useRef<number | null>(null)
  const nextPointIdRef = useRef(1)

  const totalSpokes = Math.max(state.wheel_total_spokes, 1)
  const currentSpoke = state.wheel_current_spoke
  const currentAngle = getWheelReferenceAngle(state)
  const wheelRotationDegrees = getWheelVisualRotationDegrees(state)
  const leftKg = state.spoke_tension_left_kg
  const rightKg = state.spoke_tension_right_kg
  const capturedPairs = points.length
  const leftMeasuredSpokes = useMemo<[number, number]>(() => [
    getWrappedSpoke(currentSpoke, totalSpokes),
    getWrappedSpoke(currentSpoke + 2, totalSpokes),
  ], [currentSpoke, totalSpokes])
  const rightMeasuredSpokes = useMemo<[number, number]>(() => [
    getWrappedSpoke(currentSpoke + 1, totalSpokes),
    getWrappedSpoke(currentSpoke + 4, totalSpokes),
  ], [currentSpoke, totalSpokes])

  const captureCurrentPoint = useCallback(() => {
    const point: TensionPoint = {
      id: nextPointIdRef.current,
      referenceSpoke: currentSpoke,
      leftSpokes: leftMeasuredSpokes,
      rightSpokes: rightMeasuredSpokes,
      angle: currentAngle,
      leftKg,
      rightKg,
    }

    nextPointIdRef.current += 1

    setPoints((currentPoints) => [
      ...currentPoints.filter(
        (item) => item.referenceSpoke !== point.referenceSpoke,
      ),
      point,
    ].sort((left, right) => left.referenceSpoke - right.referenceSpoke))
  }, [
    currentAngle,
    currentSpoke,
    leftKg,
    leftMeasuredSpokes,
    rightKg,
    rightMeasuredSpokes,
  ])

  useEffect(() => {
    if (!isCollecting || !state.wheel_is_running) {
      return
    }

    if (lastCapturedSpokeRef.current === currentSpoke) {
      return
    }

    lastCapturedSpokeRef.current = currentSpoke
    captureCurrentPoint()
  }, [
    captureCurrentPoint,
    currentSpoke,
    isCollecting,
    state.wheel_is_running,
  ])

  const wheelSpokes = useMemo(() => {
    const center = 120
    const innerRadius = 34
    const outerRadius = 108
    const degreesPerSpoke = 360 / totalSpokes

    return Array.from({ length: totalSpokes }, (_, index) => {
      const spoke = index + 1
      const radians = ((index * degreesPerSpoke - 90) * Math.PI) / 180

      return {
        spoke,
        isLeftMeasured: leftMeasuredSpokes.includes(spoke),
        isRightMeasured: rightMeasuredSpokes.includes(spoke),
        x1: center + innerRadius * Math.cos(radians),
        y1: center + innerRadius * Math.sin(radians),
        x2: center + outerRadius * Math.cos(radians),
        y2: center + outerRadius * Math.sin(radians),
      }
    })
  }, [leftMeasuredSpokes, rightMeasuredSpokes, totalSpokes])

  const summary = useMemo(() => {
    if (points.length === 0) {
      return {
        leftAverage: 0,
        rightAverage: 0,
        maxDifference: 0,
      }
    }

    const total = points.reduce(
      (accumulator, point) => ({
        left: accumulator.left + point.leftKg,
        right: accumulator.right + point.rightKg,
        difference: Math.max(
          accumulator.difference,
          Math.abs(point.leftKg - point.rightKg),
        ),
      }),
      { left: 0, right: 0, difference: 0 },
    )

    return {
      leftAverage: total.left / points.length,
      rightAverage: total.right / points.length,
      maxDifference: total.difference,
    }
  }, [points])

  function handleStartCollection() {
    lastCapturedSpokeRef.current = null
    setIsCollecting(true)
    sendCommand({ action: 'spoke_tension_start_collection' })

    if (!state.wheel_is_running) {
      sendCommand({ action: 'motor_roda_start' })
    }
  }

  function handleStopCollection() {
    setIsCollecting(false)
    lastCapturedSpokeRef.current = null
    sendCommand({ action: 'spoke_tension_stop_collection' })
    sendCommand({ action: 'motor_roda_stop' })
  }

  function handleTare(side: 'left' | 'right' | 'both') {
    sendCommand({
      action: 'spoke_tension_tare',
      side,
    })
  }

  function handleSaveCalibration(side: 'left' | 'right') {
    const factor = Number(
      side === 'left' ? leftCalibrationFactor : rightCalibrationFactor,
    )

    if (!Number.isFinite(factor)) {
      return
    }

    sendCommand({
      action: 'spoke_tension_set_calibration',
      side,
      factor,
    })
  }

  function handleClearPoints() {
    setPoints([])
    lastCapturedSpokeRef.current = null
  }

  return (
    <div className="screen-page spoke-tension-screen">
      <header className="spoke-tension-header">
        <div>
          <span className="spoke-tension-kicker">HX711</span>
          <h2 className="screen-page-title">Tensao dos raios</h2>
          <p>Coleta dos pares de raios nos dois lados da roda.</p>
        </div>

        <div className="spoke-tension-reference">
          <span>Referencia da roda</span>
          <strong>Raio {currentSpoke}/{totalSpokes}</strong>
          <small>{currentAngle.toFixed(1)} graus</small>
        </div>
      </header>

      <section className="spoke-tension-actions">
        <div className="spoke-tension-actions__group">
          <button
            type="button"
            className="spoke-tension-button spoke-tension-button--primary"
            onClick={handleStartCollection}
            disabled={isCollecting}
          >
            Comecar coleta
          </button>

          <button
            type="button"
            className="spoke-tension-button"
            onClick={handleStopCollection}
            disabled={!isCollecting}
          >
            Parar
          </button>

          <button
            type="button"
            className="spoke-tension-button"
            onClick={captureCurrentPoint}
          >
            Capturar atual
          </button>
        </div>

        <button
          type="button"
          className="spoke-tension-button spoke-tension-button--danger"
          onClick={handleClearPoints}
          disabled={points.length === 0}
        >
          Limpar
        </button>
      </section>

      <section className="spoke-tension-layout">
        <div className="spoke-tension-sensor-panel spoke-tension-sensor-panel--left">
          <span>Lado esquerdo</span>
          <strong>{formatKg(leftKg)}</strong>
          <small>Raios {formatPair(leftMeasuredSpokes)}</small>
        </div>

        <div className="spoke-tension-wheel-card">
          <div className="spoke-tension-wheel-card__header">
            <span>{isCollecting ? 'Coletando' : 'Pronto'}</span>
            <strong>{capturedPairs}/{totalSpokes}</strong>
          </div>

          <svg
            className="spoke-tension-wheel"
            viewBox="0 0 240 240"
            role="img"
            aria-label={`Roda no raio ${currentSpoke}`}
          >
            <g
              className="spoke-tension-wheel__rotor"
              style={{
                transform: `rotate(${wheelRotationDegrees}deg)`,
              }}
            >
              <circle className="spoke-tension-wheel__rim" cx="120" cy="120" r="108" />
              <circle className="spoke-tension-wheel__hub" cx="120" cy="120" r="30" />

              {wheelSpokes.map((spoke) => (
                <line
                  key={spoke.spoke}
                  className={
                    [
                      'spoke-tension-wheel__spoke',
                      spoke.spoke === currentSpoke ? 'is-current' : '',
                      spoke.isLeftMeasured ? 'is-left-measured' : '',
                      spoke.isRightMeasured ? 'is-right-measured' : '',
                    ].filter(Boolean).join(' ')
                  }
                  x1={spoke.x1}
                  y1={spoke.y1}
                  x2={spoke.x2}
                  y2={spoke.y2}
                />
              ))}
            </g>

            <g className="spoke-tension-wheel__fixture spoke-tension-wheel__fixture--left">
              <path d="M22 74 L64 60 L76 82 L60 120 L76 158 L64 180 L22 166 Z" />
              <circle cx="62" cy="88" r="5" />
              <circle cx="62" cy="152" r="5" />
            </g>
            <g className="spoke-tension-wheel__fixture spoke-tension-wheel__fixture--right">
              <path d="M218 74 L176 60 L164 82 L180 120 L164 158 L176 180 L218 166 Z" />
              <circle cx="178" cy="88" r="5" />
              <circle cx="178" cy="152" r="5" />
            </g>
            <line className="spoke-tension-wheel__reference" x1="120" y1="18" x2="120" y2="42" />
          </svg>
        </div>

        <div className="spoke-tension-sensor-panel spoke-tension-sensor-panel--right">
          <span>Lado direito</span>
          <strong>{formatKg(rightKg)}</strong>
          <small>Raios {formatPair(rightMeasuredSpokes)}</small>
        </div>
      </section>

      <section className="spoke-tension-bottom">
        <div className="spoke-tension-calibration">
          <div className="spoke-tension-section-header">
            <h3>Calibracao</h3>
            <button type="button" onClick={() => handleTare('both')}>
              Tara ambos
            </button>
          </div>

          <div className="spoke-tension-calibration__grid">
            <label>
              <span>Fator esquerdo</span>
              <input
                type="number"
                value={leftCalibrationFactor}
                step="0.01"
                onChange={(event) => setLeftCalibrationFactor(event.target.value)}
              />
              <div>
                <button type="button" onClick={() => handleTare('left')}>
                  Tara
                </button>
                <button type="button" onClick={() => handleSaveCalibration('left')}>
                  Salvar
                </button>
              </div>
            </label>

            <label>
              <span>Fator direito</span>
              <input
                type="number"
                value={rightCalibrationFactor}
                step="0.01"
                onChange={(event) => setRightCalibrationFactor(event.target.value)}
              />
              <div>
                <button type="button" onClick={() => handleTare('right')}>
                  Tara
                </button>
                <button type="button" onClick={() => handleSaveCalibration('right')}>
                  Salvar
                </button>
              </div>
            </label>
          </div>
        </div>

        <div className="spoke-tension-summary">
          <div>
            <span>Media esquerda</span>
            <strong>{formatKg(summary.leftAverage)}</strong>
          </div>
          <div>
            <span>Media direita</span>
            <strong>{formatKg(summary.rightAverage)}</strong>
          </div>
          <div>
            <span>Maior diferenca</span>
            <strong>{formatKg(summary.maxDifference)}</strong>
          </div>
        </div>
      </section>

      <section className="spoke-tension-table-area">
        <table className="spoke-tension-table">
          <thead>
            <tr>
              <th>Raio/par</th>
              <th>Par esquerdo</th>
              <th>Par direito</th>
              <th>Angulo</th>
              <th>Esquerdo</th>
              <th>Direito</th>
              <th>Diferenca</th>
            </tr>
          </thead>
          <tbody>
            {points.length === 0 ? (
              <tr>
                <td colSpan={7}>Nenhuma coleta registrada.</td>
              </tr>
            ) : (
              points.map((point) => (
                <tr key={point.id}>
                  <td>{point.referenceSpoke}</td>
                  <td>{formatPair(point.leftSpokes)}</td>
                  <td>{formatPair(point.rightSpokes)}</td>
                  <td>{point.angle.toFixed(1)} graus</td>
                  <td>{formatKg(point.leftKg)}</td>
                  <td>{formatKg(point.rightKg)}</td>
                  <td>{formatKg(Math.abs(point.leftKg - point.rightKg))}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}
