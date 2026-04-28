import { ScreenLogs } from '../../ScreenGenerico/ScreenLogs'
import type { MachineLog } from '../../../types/machine/machine'

import './LogsScreen.css'

type LogsScreenProps = {
  logs: MachineLog[]
}

export function LogsScreen({ logs }: LogsScreenProps) {
  return (
    <div className="screen-page logs-screen">
      <h2 className="screen-page-title">Logs</h2>

      <div className="logs-screen-box">
        <ScreenLogs logs={logs} />
      </div>
    </div>
  )
}