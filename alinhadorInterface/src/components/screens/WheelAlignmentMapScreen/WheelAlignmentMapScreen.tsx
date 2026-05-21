import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useMachineContext } from '../../../context/useMachineContext'
import {
  getSafeTotalSpokes,
  getWheelReferenceAngle,
  getWrappedSpoke,
} from '../../../utils/wheelReference'

import './WheelAlignmentMapScreen.css'

type WheelMapPoint = {
  spoke: number
  angle: number
  value: number
  captureId: number
}

function getPointStatus(value: number) {
  const absoluteValue = Math.abs(value)

  if (absoluteValue <= 1) {
    return { label: 'OK', className: 'ok' }
  }

  if (absoluteValue <= 3) {
    return { label: 'Atencao', className: 'warning' }
  }

  return { label: 'Alto', className: 'danger' }
}

function getPointColor(value: number | null) {
  if (value === null) {
    return '#d6e1f3'
  }

  const status = getPointStatus(value)

  if (status.className === 'ok') {
    return '#11953b'
  }

  if (status.className === 'warning') {
    return '#f59e0b'
  }

  return '#dc2626'
}

function formatSigned(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)} mm`
}

export function WheelAlignmentMapScreen() {
  const { state, sendCommand } = useMachineContext()
  const [points, setPoints] = useState<WheelMapPoint[]>([])
  const [isAutoCollecting, setIsAutoCollecting] = useState(false)
  const nextCaptureIdRef = useRef(1)
  const lastCapturedSpokeRef = useRef<number | null>(null)

  const totalSpokes = getSafeTotalSpokes(state.wheel_total_spokes)
  const degreesPerSpoke = 360 / totalSpokes
  const currentAngle = getWheelReferenceAngle(state)
  const currentSpoke = getWrappedSpoke(state.wheel_current_spoke, totalSpokes)
  const lateralValue = state.lateral_misalignment_current

  const capturePoint = useCallback((spoke: number, angle: number, value: number) => {
    const captureId = nextCaptureIdRef.current
    nextCaptureIdRef.current += 1

    const point: WheelMapPoint = {
      spoke,
      angle,
      value,
      captureId,
    }

    setPoints((currentPoints) => [
      ...currentPoints.filter((item) => item.spoke !== point.spoke),
      point,
    ].sort((left, right) => left.spoke - right.spoke))
  }, [])

  useEffect(() => {
    if (!isAutoCollecting || !state.wheel_is_running) {
      return
    }

    if (lastCapturedSpokeRef.current === currentSpoke) {
      return
    }

    lastCapturedSpokeRef.current = currentSpoke
    capturePoint(currentSpoke, currentAngle, lateralValue)
  }, [
    currentAngle,
    currentSpoke,
    capturePoint,
    isAutoCollecting,
    lateralValue,
    state.wheel_is_running,
  ])

  const pointsBySpoke = useMemo(() => {
    const map = new Map<number, WheelMapPoint>()

    for (const point of points) {
      map.set(point.spoke, point)
    }

    return map
  }, [points])

  const wheelMarkers = useMemo(() => {
    const center = 120
    const innerRadius = 46
    const outerRadius = 98
    const labelRadius = 111

    return Array.from({ length: totalSpokes }, (_, index) => {
      const spoke = index + 1
      const angle = index * degreesPerSpoke
      const radians = ((angle - 90) * Math.PI) / 180
      const point = pointsBySpoke.get(spoke)
      const value = point?.value ?? null

      return {
        spoke,
        point,
        color: getPointColor(value),
        x1: center + innerRadius * Math.cos(radians),
        y1: center + innerRadius * Math.sin(radians),
        x2: center + outerRadius * Math.cos(radians),
        y2: center + outerRadius * Math.sin(radians),
        labelX: center + labelRadius * Math.cos(radians),
        labelY: center + labelRadius * Math.sin(radians),
      }
    })
  }, [degreesPerSpoke, pointsBySpoke, totalSpokes])

  const summary = useMemo(() => {
    if (points.length === 0) {
      return {
        maxPositive: null as WheelMapPoint | null,
        maxNegative: null as WheelMapPoint | null,
        worst: null as WheelMapPoint | null,
        average: 0,
        amplitude: 0,
      }
    }

    let maxPositive = points[0]
    let maxNegative = points[0]
    let worst = points[0]
    let min = points[0].value
    let max = points[0].value
    let total = 0

    for (const point of points) {
      if (point.value > maxPositive.value) {
        maxPositive = point
      }

      if (point.value < maxNegative.value) {
        maxNegative = point
      }

      if (Math.abs(point.value) > Math.abs(worst.value)) {
        worst = point
      }

      min = Math.min(min, point.value)
      max = Math.max(max, point.value)
      total += point.value
    }

    return {
      maxPositive,
      maxNegative,
      worst,
      average: total / points.length,
      amplitude: max - min,
    }
  }, [points])

  function handleCaptureCurrentPoint() {
    lastCapturedSpokeRef.current = currentSpoke
    capturePoint(currentSpoke, currentAngle, lateralValue)
  }

  function handleStartAutoCollecting() {
    lastCapturedSpokeRef.current = null
    setIsAutoCollecting(true)
    sendCommand({ action: 'lateral_sensor_start_reading' })

    if (!state.wheel_is_running) {
      sendCommand({ action: 'motor_roda_start' })
    }
  }

  function handleStopAutoCollecting() {
    setIsAutoCollecting(false)
    lastCapturedSpokeRef.current = null
    sendCommand({ action: 'motor_roda_stop' })
    sendCommand({ action: 'lateral_sensor_stop_reading' })
  }

  function handleCaptureAndNext() {
    handleCaptureCurrentPoint()
    sendCommand({ action: 'motor_roda_next_spoke' })
  }

  function handleClearPoints() {
    setPoints([])
    lastCapturedSpokeRef.current = null
  }

  return (
    <div className="screen-page wheel-map-screen">
      <header className="wheel-map-header">
        <div>
          <span className="wheel-map-kicker">Mapa de desalinhamento</span>
          <h2 className="screen-page-title">Roda por raio</h2>
          <p>Leitura lateral associada ao raio e ao angulo atual da roda.</p>
        </div>

        <div className="wheel-map-live-status">
          <span>Ao vivo</span>
          <strong>{formatSigned(lateralValue)}</strong>
          <small>
            Raio {currentSpoke}/{totalSpokes} - {currentAngle.toFixed(1)} graus
          </small>
        </div>
      </header>

      <section className="wheel-map-actions">
        <div className="wheel-map-actions__group">
          <button
            type="button"
            onClick={handleStartAutoCollecting}
            disabled={isAutoCollecting}
          >
            Coletar girando
          </button>
          <button
            type="button"
            onClick={handleStopAutoCollecting}
            disabled={!isAutoCollecting}
          >
            Pausar coleta
          </button>
        </div>

        <div className="wheel-map-actions__group">
          <button
            type="button"
            onClick={() => sendCommand({ action: 'motor_roda_previous_spoke' })}
          >
            Raio anterior
          </button>
          <button type="button" onClick={handleCaptureCurrentPoint}>
            Capturar atual
          </button>
          <button type="button" onClick={handleCaptureAndNext}>
            Capturar e proximo
          </button>
          <button
            type="button"
            onClick={() => sendCommand({ action: 'motor_roda_next_spoke' })}
          >
            Proximo raio
          </button>
        </div>

        <button
          type="button"
          className="wheel-map-actions__clear"
          onClick={handleClearPoints}
          disabled={points.length === 0}
        >
          Limpar mapa
        </button>
      </section>

      <section className="wheel-map-layout">
        <div className="wheel-map-visual">
          <div className="wheel-map-visual__header">
            <div>
              <h3>Mapa circular</h3>
              <p>
                {points.length} de {totalSpokes} raios coletados - {' '}
                {isAutoCollecting ? 'coleta automatica ativa' : 'coleta manual'}
              </p>
            </div>
          </div>

          <svg className="wheel-map-svg" viewBox="0 0 240 240" role="img">
            <circle className="wheel-map-svg__rim" cx="120" cy="120" r="98" />
            <circle className="wheel-map-svg__hub" cx="120" cy="120" r="34" />

            {wheelMarkers.map((marker) => (
              <line
                key={`spoke-${marker.spoke}`}
                className={
                  marker.spoke === currentSpoke
                    ? 'wheel-map-svg__spoke is-current'
                    : 'wheel-map-svg__spoke'
                }
                x1={marker.x1}
                y1={marker.y1}
                x2={marker.x2}
                y2={marker.y2}
                stroke={marker.color}
              />
            ))}

            {wheelMarkers.map((marker) => (
              <circle
                key={`point-${marker.spoke}`}
                className="wheel-map-svg__point"
                cx={marker.x2}
                cy={marker.y2}
                r={marker.point ? 5 : 3}
                fill={marker.color}
              />
            ))}

            {wheelMarkers.map((marker) => (
              marker.spoke % Math.ceil(totalSpokes / 12) === 1 ||
              marker.spoke === currentSpoke ? (
                <text
                  key={`label-${marker.spoke}`}
                  className="wheel-map-svg__label"
                  x={marker.labelX}
                  y={marker.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {marker.spoke}
                </text>
              ) : null
            ))}
          </svg>
        </div>

        <div className="wheel-map-summary">
          <div className="wheel-map-summary__item">
            <span>Pior ponto</span>
            <strong>
              {summary.worst
                ? `Raio ${summary.worst.spoke} - ${formatSigned(summary.worst.value)}`
                : '-'}
            </strong>
          </div>
          <div className="wheel-map-summary__item">
            <span>Maior positivo</span>
            <strong>
              {summary.maxPositive
                ? `Raio ${summary.maxPositive.spoke} - ${formatSigned(summary.maxPositive.value)}`
                : '-'}
            </strong>
          </div>
          <div className="wheel-map-summary__item">
            <span>Maior negativo</span>
            <strong>
              {summary.maxNegative
                ? `Raio ${summary.maxNegative.spoke} - ${formatSigned(summary.maxNegative.value)}`
                : '-'}
            </strong>
          </div>
          <div className="wheel-map-summary__item">
            <span>Media</span>
            <strong>{formatSigned(summary.average)}</strong>
          </div>
          <div className="wheel-map-summary__item">
            <span>Amplitude</span>
            <strong>{summary.amplitude.toFixed(2)} mm</strong>
          </div>
        </div>
      </section>

      <section className="wheel-map-table-area">
        <table className="wheel-map-table">
          <thead>
            <tr>
              <th>Raio</th>
              <th>Angulo</th>
              <th>Desalinhamento</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {points.length === 0 ? (
              <tr>
                <td colSpan={4}>Nenhum ponto coletado.</td>
              </tr>
            ) : (
              points.map((point) => {
                const status = getPointStatus(point.value)

                return (
                  <tr key={`${point.spoke}-${point.captureId}`}>
                    <td>{point.spoke}</td>
                    <td>{point.angle.toFixed(1)} graus</td>
                    <td>{formatSigned(point.value)}</td>
                    <td>
                      <span className={`wheel-map-table__status ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}
