import { ScreenSidebar } from './ScreenSideBar'
import { ScreenLogs } from '../../components/Screen/ScreenLogs'
import { ScreenStatusBar } from './ScreenStatusBar'

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
  led = 'Desligado',
  databaseConnection = 'Desconectado',
  arduinoConnection = 'Desconectado',
  extraLabel = 'Estatico',
  extraValue = 'Estatico',
  progressLabel = 'Estatico',
  progressValue = 50,


}: ScreenMainProps) {
  return (
    <>
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
      <ScreenStatusBar
        arduinoConnection={arduinoConnection}
        led={led}
      />
    </>
  )
}