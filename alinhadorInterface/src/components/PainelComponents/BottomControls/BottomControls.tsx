import type { BottomAction } from '../../../types/bottomControls'

type BottomControlsProps = {
  actions: BottomAction[]
}

export function BottomControls({ actions }: BottomControlsProps) {
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