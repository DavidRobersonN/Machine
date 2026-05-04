import { memo } from 'react'

import type { BottomAction } from '../../../types/bottomControls'

type BottomControlsProps = {
  actions: BottomAction[]
}

function BottomControlsComponent({ actions }: BottomControlsProps) {
  return (
    <>
      {actions.map((action, index) => (
        <button
          key={index}
          className={`btn btn-${action.variant ?? 'orange'}`}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </>
  )
}

export const BottomControls = memo(BottomControlsComponent)