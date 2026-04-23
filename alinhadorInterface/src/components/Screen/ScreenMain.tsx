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
  children?: ReactNode
}

export function ScreenMain({
  logs,
  sidebar,
  statusBar,
  children,
}: ScreenMainProps) {
  return (
    <>
      <div className="screen-main">
        <div className="screen-main-content">
          {children}
        </div>

        <ScreenLogs logs={logs} />

        {sidebar}
      </div>

      {statusBar}
    </>
  )
}