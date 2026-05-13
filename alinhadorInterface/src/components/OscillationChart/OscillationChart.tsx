import { useMemo } from 'react'

import type { MisalignmentPoint } from '../../types/machine/machine'
import './OscillationChart.css'

type OscillationChartProps = {
  title: string
  value: number
  points: MisalignmentPoint[]
  minValue?: number
  maxValue?: number
  unit?: string
}

function polarNormalizeY({
  pointValue,
  minValue,
  maxValue,
  height,
  padding,
  usableHeight,
}: {
  pointValue: number
  minValue: number
  maxValue: number
  height: number
  padding: number
  usableHeight: number
}) {
  const clampedValue = Math.max(minValue, Math.min(maxValue, pointValue))
  const percentage = (clampedValue - minValue) / (maxValue - minValue)

  return height - padding - percentage * usableHeight
}

export function OscillationChart({
  title,
  value,
  points,
  minValue = -15,
  maxValue = 15,
  unit = ' mm',
}: OscillationChartProps) {
  const width = 520
  const height = 240
  const padding = 20

  const usableWidth = width - padding * 2
  const usableHeight = height - padding * 2

  const centerY = useMemo(() => {
    return polarNormalizeY({
      pointValue: 0,
      minValue,
      maxValue,
      height,
      padding,
      usableHeight,
    })
  }, [minValue, maxValue, height, padding, usableHeight])

  const linePoints = useMemo(() => {
    function normalizeX(index: number) {
      if (points.length <= 1) {
        return padding
      }

      return padding + (index / (points.length - 1)) * usableWidth
    }

    return points
      .map((point, index) => {
        const x = normalizeX(index)

        const y = polarNormalizeY({
          pointValue: point.value,
          minValue,
          maxValue,
          height,
          padding,
          usableHeight,
        })

        return `${x},${y}`
      })
      .join(' ')
  }, [
    points,
    minValue,
    maxValue,
    height,
    padding,
    usableHeight,
    usableWidth,
  ])

  return (
    <div className="oscillation-chart">
      <div className="oscillation-chart-header">
        <div>
          <h2 className="oscillation-chart-title">{title}</h2>

          <p className="oscillation-chart-subtitle">
            Desalinhamento lateral em tempo real
          </p>
        </div>

        <strong className="oscillation-chart-value">
          {value.toFixed(2)}
          {unit}
        </strong>
      </div>

      <svg
        className="oscillation-chart-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={title}
      >
        <rect
          x={padding}
          y={padding}
          width={usableWidth}
          height={usableHeight}
          className="oscillation-chart-border"
        />

        <line
          x1={padding}
          y1={centerY}
          x2={width - padding}
          y2={centerY}
          className="oscillation-chart-center-line"
        />

        <text
          x={padding}
          y={padding - 6}
          className="oscillation-chart-axis-text"
        >
          +{maxValue}
          {unit}
        </text>

        <text
          x={padding}
          y={centerY - 6}
          className="oscillation-chart-axis-text"
        >
          0
          {unit}
        </text>

        <text
          x={padding}
          y={height - 4}
          className="oscillation-chart-axis-text"
        >
          {minValue}
          {unit}
        </text>

        {points.length > 1 && (
          <polyline
            points={linePoints}
            className="oscillation-chart-line"
          />
        )}
      </svg>
    </div>
  )
}
