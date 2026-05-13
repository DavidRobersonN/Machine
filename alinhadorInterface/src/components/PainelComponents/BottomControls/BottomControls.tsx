import { memo } from 'react'

import type { BottomAction } from '../../../types/bottomControls'

import './BottomControls.css'

type BottomControlsProps = {
  actions: BottomAction[]
}

function getActionKind(label: string) {
  const normalizedLabel = label.toLowerCase()

  if (normalizedLabel.includes('entrar')) {
    return 'enter'
  }

  if (normalizedLabel.includes('voltar')) {
    return 'back'
  }

  if (normalizedLabel.includes('limpar')) {
    return 'clear'
  }

  if (normalizedLabel.includes('atualizar')) {
    return 'refresh'
  }

  if (normalizedLabel.includes('desconectar')) {
    return 'disconnect'
  }

  return 'default'
}

function BottomControlsComponent({ actions }: BottomControlsProps) {
  return (
    <>
      {actions.map((action) => {
        const variant = action.variant ?? 'orange'
        const kind = getActionKind(action.label)

        return (
          <button
            key={`${action.label}-${variant}`}
            type="button"
            className={[
              'bottom-control-button',
              `bottom-control-button--${variant}`,
              `bottom-control-button--${kind}`,
            ].join(' ')}
            onClick={action.onClick}
          >
            <span className="bottom-control-button__icon" aria-hidden="true" />
            <span className="bottom-control-button__label">{action.label}</span>
          </button>
        )
      })}
    </>
  )
}

export const BottomControls = memo(BottomControlsComponent)
