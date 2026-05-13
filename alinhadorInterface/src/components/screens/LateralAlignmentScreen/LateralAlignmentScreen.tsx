import { useCallback, useMemo } from 'react'

import type { MisalignmentPoint } from '../../../types/machine/machine'

import { useMachineContext } from '../../../context/useMachineContext'
import { OscillationChart } from '../../OscillationChart/OscillationChart'

import './LateralAlignmentScreen.css'

type LateralAlignmentScreenProps = {
  value: number
  history: MisalignmentPoint[]
}

function getAlignmentStatus(value: number) {
  const absoluteValue = Math.abs(value)

  if (absoluteValue <= 1) {
    return {
      label: 'Dentro da tolerância',
      description: 'A leitura lateral está próxima do centro.',
      className: 'ok',
    }
  }

  if (absoluteValue <= 5) {
    return {
      label: 'Atenção',
      description: 'Existe uma variação lateral moderada.',
      className: 'warning',
    }
  }

  return {
    label: 'Fora da tolerância',
    description: 'A roda apresenta desalinhamento lateral elevado.',
    className: 'danger',
  }
}

export function LateralAlignmentScreen({
  value,
  history,
}: LateralAlignmentScreenProps) {
  const { state, sendCommand } = useMachineContext()

  const handleStartLateralReading = useCallback(() => {
    sendCommand({
      action: 'lateral_sensor_start_reading',
    })
  }, [sendCommand])

  const handleStopLateralReading = useCallback(() => {
    sendCommand({
      action: 'lateral_sensor_stop_reading',
    })
  }, [sendCommand])

  const {
    maxLeftValue,
    maxRightValue,
    averageValue,
    amplitudeValue,
  } = useMemo(() => {
    if (history.length === 0) {
      return {
        maxLeftValue: 0,
        maxRightValue: 0,
        averageValue: 0,
        amplitudeValue: 0,
      }
    }

    let max = history[0].value
    let min = history[0].value
    let maxLeft = 0
    let maxRight = 0
    let total = 0

    for (const point of history) {
      if (point.value > max) {
        max = point.value
      }

      if (point.value < min) {
        min = point.value
      }

      if (point.value < 0) {
        maxLeft = Math.max(maxLeft, Math.abs(point.value))
      }

      if (point.value > 0) {
        maxRight = Math.max(maxRight, point.value)
      }

      total += point.value
    }

    return {
      maxLeftValue: maxLeft,
      maxRightValue: maxRight,
      averageValue: total / history.length,
      amplitudeValue: max - min,
    }
  }, [history])

  const status = getAlignmentStatus(value)
  const isReadingEnabled = state.is_lateral_reading_enabled

  return (
    <div className="screen-page lateral-alignment-screen">
      <header className="lateral-alignment-header">
        <div>
          <span className="lateral-alignment-kicker">Sensor lateral</span>

          <h2 className="screen-page-title">Alinhamento lateral</h2>

          <p>
            Monitore a oscilação lateral da roda em tempo real e acompanhe os
            limites de variação durante a leitura.
          </p>
        </div>

        <div className={`lateral-alignment-status ${status.className}`}>
          <span>Status</span>
          <strong>{status.label}</strong>
          <p>{status.description}</p>
        </div>
      </header>

      <section className="lateral-alignment-actions">
        <div className="lateral-alignment-actions__status">
          <span>Leitura</span>
          <strong>{isReadingEnabled ? 'Ativa' : 'Parada'}</strong>
        </div>

        <div className="lateral-alignment-actions__buttons">
          <button
            type="button"
            className="lateral-alignment-action-button primary"
            onClick={handleStartLateralReading}
            disabled={isReadingEnabled}
          >
            Iniciar leitura
          </button>

          <button
            type="button"
            className="lateral-alignment-action-button danger"
            onClick={handleStopLateralReading}
            disabled={!isReadingEnabled}
          >
            Parar leitura
          </button>
        </div>
      </section>

      <section className="lateral-alignment-main-card">
        <div className="lateral-alignment-chart-header">
          <div>
            <h3>Oscilação lateral</h3>
            <p>Escala atual de -15 mm até 15 mm.</p>
          </div>

          <div className="lateral-alignment-current-value">
            <span>Leitura atual</span>
            <strong>{value.toFixed(2)} mm</strong>
          </div>
        </div>

        <OscillationChart
          title="Gráfico de oscilação"
          value={value}
          points={history}
          minValue={-15}
          maxValue={15}
          unit=" mm"
        />
      </section>

      <section className="lateral-alignment-cards">
        <div className="lateral-alignment-card current">
          <span>Atual</span>
          <strong>{value.toFixed(2)} mm</strong>
        </div>

        <div className="lateral-alignment-card left">
          <span>Max. esquerda</span>
          <strong>{maxLeftValue.toFixed(2)} mm</strong>
        </div>

        <div className="lateral-alignment-card right">
          <span>Max. direita</span>
          <strong>{maxRightValue.toFixed(2)} mm</strong>
        </div>

        <div className="lateral-alignment-card">
          <span>Média</span>
          <strong>{averageValue.toFixed(2)} mm</strong>
        </div>

        <div className="lateral-alignment-card">
          <span>Amplitude</span>
          <strong>{amplitudeValue.toFixed(2)} mm</strong>
        </div>
      </section>
    </div>
  )
}
