import { BotaoRedondoVermelho } from '../../BotoesGenericos/BotaoRedondoVermelho'
import { BotaoRedondoVerde } from '../../BotoesGenericos/BotaoRedondoVerde'

import './ToggleControl.css'

type ToggleControlProps = {
  onAction: () => void
  offAction: () => void
  onLabel: string
  offLabel: string
}

export function ToggleControl({
  onAction,
  offAction,
  onLabel,
  offLabel,
}: ToggleControlProps) {
  return (
    <div className="toggle-control">
      {/* Botão genérico de ação "ligar / ativar / iniciar" */}
      <BotaoRedondoVerde
        nome={onLabel}
        onClick={onAction}
      />

      {/* Botão genérico de ação "desligar / desativar / parar" */}
      <BotaoRedondoVermelho
        nome={offLabel}
        onClick={offAction}
      />
    </div>
  )
}