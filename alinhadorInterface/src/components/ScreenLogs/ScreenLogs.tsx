import { useMachineContext } from '../../context/MachineContext';
import './Styles.css'

export function ScreenLogs() {
  const { state } = useMachineContext();

  return (
    <>
    <div className="screen-canvas">
  <div className="screen-log">
    {state.logs.length === 0 ? (
      <p className="screen-log-empty">Nenhuma mensagem ainda...</p>
    ) : (
      state.logs.map((log, index) => (
        <div key={index} className={`screen-log-line ${log.direction}`}>
          <span className="log-type">
            {log.direction === 'sent' ? '→ Enviado' : '← Recebido'}
          </span>
          <span className="log-message">{log.message}</span>
        </div>
      ))
    )}
  </div>
</div>
    </>
  )
}