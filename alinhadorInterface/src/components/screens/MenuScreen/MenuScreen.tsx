import './MenuScreen.css'

type MenuScreenProps = {
  onSelectLed: () => void
  onSelectLogs: () => void
  onSelectSerial: () => void
  onSelectMotors: () => void
  onSelectAlignment: () => void
}

export function MenuScreen({
  onSelectLed,
  onSelectLogs,
  onSelectSerial,
  onSelectMotors,
  onSelectAlignment,
}: MenuScreenProps) {
  return (
    <div className="screen-page">
      <h2 className="screen-page-title">Menu principal</h2>

      <div className="screen-page-actions">
        <button className="btn btn-green" onClick={onSelectLed}>
          LED
        </button>

        <button className="btn btn-green" onClick={onSelectMotors}>
          Motores
        </button>

        <button className="btn btn-green" onClick={onSelectAlignment}>
          Alinhamento lateral
        </button>

        <button className="btn btn-green" onClick={onSelectLogs}>
          Logs
        </button>

        <button className="btn btn-green" onClick={onSelectSerial}>
          Portas COM
        </button>
      </div>
    </div>
  )
}