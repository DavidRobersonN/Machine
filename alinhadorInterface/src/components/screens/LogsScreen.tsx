import { ScreenLogs } from '../Screen/ScreenLogs'
import type { MachineLog } from '../../types/machine'

type LogsScreenProps = {
  logs: MachineLog[]
  onBack: () => void
}

export function LogsScreen({ logs, onBack }: LogsScreenProps) {
  return (
    <div className="screen-page">
      <h2 className="screen-page-title">Logs</h2>

      <div className="logs-screen-box">
        <ScreenLogs logs={logs} />
      </div>

      <div className="screen-page-actions">
        <button className="btn btn-orange" onClick={onBack}>
          Voltar para o menu
        </button>
      </div>
    </div>
  )
}