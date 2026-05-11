import { memo } from 'react'
import type { ReactNode } from 'react'

import './Styles.css'

type ScreenMainProps = {
  children?: ReactNode
  painelControls?: ReactNode
}

function ScreenMainComponent({
  children,
  painelControls,
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

export const ScreenMain = memo(ScreenMainComponent)