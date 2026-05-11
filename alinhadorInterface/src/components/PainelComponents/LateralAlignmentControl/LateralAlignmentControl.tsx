import { useCallback } from 'react'

import { useMachineContext } from '../../../context/MachineContext'

import './LateralAlignmentControl.css'

export function LateralAlignmentControl() {
  const { sendCommand } = useMachineContext()

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

  return (
    <aside className="lateral-alignment-control">
      <header className="lateral-alignment-control__header">
        <div>
          <span className="lateral-alignment-control__eyebrow">
            Controle do sensor
          </span>

          <h3 className="lateral-alignment-control__title">
            📡 Leitura lateral
          </h3>

          <p className="lateral-alignment-control__subtitle">
            Inicie ou pare a leitura em tempo real do sensor lateral da roda.
          </p>
        </div>
      </header>

      <div className="lateral-alignment-control__summary">
        <div className="lateral-alignment-control__summary-item">
          <span>Status</span>
          <strong>Manual</strong>
        </div>

        <div className="lateral-alignment-control__summary-item">
          <span>Origem</span>
          <strong>Arduino</strong>
        </div>
      </div>

      <section className="lateral-alignment-control__section">
        <span className="lateral-alignment-control__section-label">
          Leitura em tempo real
        </span>

        <div className="lateral-alignment-control__grid">
          <button
            type="button"
            className="lateral-alignment-control__button primary"
            onClick={handleStartLateralReading}
          >
            ▶ Iniciar leitura
          </button>

          <button
            type="button"
            className="lateral-alignment-control__button danger"
            onClick={handleStopLateralReading}
          >
            ■ Parar leitura
          </button>
        </div>
      </section>

      <section className="lateral-alignment-control__info">
        <strong>Dica de uso</strong>

        <p>
          Inicie a leitura com a roda girando devagar para acompanhar a
          variação lateral no gráfico.
        </p>
      </section>
    </aside>
  )
}