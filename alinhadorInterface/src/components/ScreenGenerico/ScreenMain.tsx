import { memo } from 'react'
import type { ReactNode } from 'react'

import './Styles.css'

type ScreenMainProps = {
  statusBar?: ReactNode
  children?: ReactNode
}

function ScreenMainComponent({
  statusBar,
  children,
}: ScreenMainProps) {
  return (
    <div className="screen-main-layout">
      <div className="painel-display-area">
        <div className="display-screen">
          <div className="screen-main no-sidebar">
            <div className="screen-main-content">
              {children}
            </div>
          </div>

          {statusBar && (
            <div className="screen-main-statusbar">
              {statusBar}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const ScreenMain = memo(ScreenMainComponent)