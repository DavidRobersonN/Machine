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
  const maxValue =
    history.length > 0
      ? Math.max(...history.map((point) => point.value))
      : 0

  const minValue =
    history.length > 0
      ? Math.min(...history.map((point) => point.value))
      : 0

  const averageValue =
    history.length > 0
      ? history.reduce((total, point) => total + point.value, 0) /
        history.length
      : 0

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