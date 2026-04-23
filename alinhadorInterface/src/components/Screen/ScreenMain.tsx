import { ScreenSidebar } from './ScreenSideBar'
import { ScreenLogs } from '../../components/Screen/ScreenLogs'

type LogDirection = 'sent' | 'received'

type ScreenLogItem = {
  direction: LogDirection
  message: string
}

type ScreenMainProps = {
  logs: ScreenLogItem[]
  led: string
  databaseConnection: string
  arduinoConnection: string
  extraLabel?: string
  extraValue?: string
  progressLabel?: string
  progressValue?: number
}

export function ScreenMain({
  logs,
  led,
  databaseConnection,
  arduinoConnection,
  extraLabel = 'Porta COM',
  extraValue = 'COM5',
  progressLabel = 'Progress',
  progressValue = 50,
}: ScreenMainProps) {
  return (
    <div className="screen-main">
      <ScreenLogs logs={logs} />

      <ScreenSidebar
        led={led}
        databaseConnection={databaseConnection}
        arduinoConnection={arduinoConnection}
        extraLabel={extraLabel}
        extraValue={extraValue}
        progressLabel={progressLabel}
        progressValue={progressValue}
      />
    </div>
  )
}