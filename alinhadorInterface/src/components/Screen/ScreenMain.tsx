import type { ReactNode } from 'react'

type ScreenMainProps = {
  sidebar?: ReactNode
  statusBar?: ReactNode
  children?: ReactNode
}

export function ScreenMain({
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

        {sidebar && (
          <div className="screen-main-sidebar">
            {sidebar}
          </div>
        )}
      </div>

      {statusBar && (
        <div className="screen-main-statusbar">
          {statusBar}
        </div>
      )}
    </>
  )
}