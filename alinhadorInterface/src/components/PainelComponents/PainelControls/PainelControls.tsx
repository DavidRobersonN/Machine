import { memo } from 'react'
import type { ReactNode } from 'react'

import './PainelControls.css'

type PainelControlsProps = {
  children?: ReactNode
}

function PainelControlsComponent({ children }: PainelControlsProps) {
  return (
    <div className="painel-controls-area">
      {children}
    </div>
  )
}

export const PainelControls = memo(PainelControlsComponent)