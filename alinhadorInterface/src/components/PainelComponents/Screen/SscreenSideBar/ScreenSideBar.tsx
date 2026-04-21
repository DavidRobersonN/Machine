import { useMachineContext } from '../../../../context/MachineContext'

export function ScreenSidebar() {
  const { state } = useMachineContext()

  return (
    <div className="screen-sidebar">
      <div className="screen-row">
        <span>Led:</span>
        <span>{state.led}</span>
      </div>

      <div className="screen-row">
        <span>Data Base</span>
        <span>{state.connected ? 'Conectado' : 'Desconectado'}</span>
      </div>

      <div className="screen-row">
        <span>Arduino</span>
        <span>{state.arduino_connected}</span>
      </div>

      <div className="screen-divider" />

      <div className="screen-row">
        <span>X:</span>
        <span>0.000</span>
      </div>

      <div className="screen-row">
        <span>Y:</span>
        <span>0.000</span>
      </div>

      <div className="screen-row">
        <span>Z:</span>
        <span>0.000</span>
      </div>

      <div className="screen-divider" />

      <div className="screen-progress-label">
        <span>Progress</span>
        <span>50%</span>
      </div>

      <div className="screen-progress">
        <div className="screen-progress-fill" />
      </div>
    </div>
  )
}