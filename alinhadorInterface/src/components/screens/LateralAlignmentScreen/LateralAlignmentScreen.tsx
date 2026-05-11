import { useMemo } from 'react'

import type { MisalignmentPoint } from '../../../types/machine/machine'

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
  const { maxValue, minValue, averageValue, amplitudeValue } = useMemo(() => {
    if (history.length === 0) {
      return {
        maxValue: 0,
        minValue: 0,
        averageValue: 0,
        amplitudeValue: 0,
      }
    }

    let max = history[0].value
    let min = history[0].value
    let total = 0

    for (const point of history) {
      if (point.value > max) {
        max = point.value
      }

      if (point.value < min) {
        min = point.value
      }

      total += point.value
    }

    return {
      maxValue: max,
      minValue: min,
      averageValue: total / history.length,
      amplitudeValue: max - min,
    }
  }, [history])

  const status = getAlignmentStatus(value)

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

        <div className="lateral-alignment-card">
          <span>Máximo</span>
          <strong>{maxValue.toFixed(2)} mm</strong>
        </div>

        <div className="lateral-alignment-card">
          <span>Mínimo</span>
          <strong>{minValue.toFixed(2)} mm</strong>
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