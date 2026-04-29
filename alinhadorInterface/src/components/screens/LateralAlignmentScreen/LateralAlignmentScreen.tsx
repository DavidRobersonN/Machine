import { useMemo } from 'react'
import type { MisalignmentPoint } from '../../../types/machine/machine'
import { OscillationChart } from '../../OscillationChart/OscillationChart'
import './LateralAlignmentScreen.css'

type LateralAlignmentScreenProps = {
  value: number
  history: MisalignmentPoint[]
}

export function LateralAlignmentScreen({
  value,
  history,
}: LateralAlignmentScreenProps) {
  const { maxValue, minValue, averageValue } = useMemo(() => {
    if (history.length === 0) {
      return {
        maxValue: 0,
        minValue: 0,
        averageValue: 0,
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
    }
  }, [history])

  return (
    <div className="screen-page lateral-alignment-screen">
      <h2 className="screen-page-title">Alinhamento lateral</h2>

      <OscillationChart
        title="Gráfico de oscilação"
        value={value}
        points={history}
        minValue={-15}
        maxValue={15}
        unit=" mm"
      />

      <div className="lateral-alignment-cards">
        <div className="lateral-alignment-card">
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
      </div>
    </div>
  )
}