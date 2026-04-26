import { PainelControls } from '../PainelComponents/PainelControls/PainelControls'
import { MotorRodaControl } from '../PainelComponents/Motors/MotorRodaControl'

import type { AppScreen } from '../../types/navigation'

type MachinePainelControlsProps = {
  currentScreen: AppScreen
}

export function MachinePainelControls({
  currentScreen,
}: MachinePainelControlsProps) {
  switch (currentScreen) {
    case 'motors':
      return <MotorRodaControl />

    default:
      return <PainelControls />
  }
}