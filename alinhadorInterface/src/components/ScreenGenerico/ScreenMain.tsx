import type { ReactNode } from 'react'

import './Styles.css'

type ScreenMainProps = {
  sidebar?: ReactNode
  statusBar?: ReactNode
  children?: ReactNode
  painelControls?: ReactNode
}

export function ScreenMain({
  sidebar,
  statusBar,
  children,
  painelControls,
}: ScreenMainProps) {
  return (
    <div className="screen-main-layout">
      <div className="painel-display-area">
        <div className="display-screen">
          <div className={`screen-main ${sidebar ? 'has-sidebar' : 'no-sidebar'}`}>
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
        </div>
      </div>

      {painelControls && (
        <div className="screen-main-painel-controls">
          {painelControls}
        </div>
      )}
    </div>
  )
}