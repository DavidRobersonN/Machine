import type { ReactNode } from 'react'
import { ScreenLogs } from '../../components/Screen/ScreenLogs'

type LogDirection = 'sent' | 'received'

type ScreenLogItem = {
  direction: LogDirection
  message: string
}

type ScreenMainProps = {
  logs: ScreenLogItem[]
  sidebar?: ReactNode
  statusBar?: ReactNode
}

export function ScreenMain({
  logs,
  sidebar,
  statusBar,
}: ScreenMainProps) {
  return (
    <>
      <div className="screen-main">
        <ScreenLogs logs={logs} />
        {sidebar}
      </div>

      {statusBar}
    </>
  )
}