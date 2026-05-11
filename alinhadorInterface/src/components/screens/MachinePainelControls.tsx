import { memo } from 'react'

import { PainelControls } from '../PainelComponents/PainelControls/PainelControls'
import { MotorRodaControl } from '../PainelComponents/Motors/MotorRodaControl'

import type { AppScreen } from '../../types/navigation'
import { LateralAlignmentControl } from '../PainelComponents/LateralAlignmentControl/LateralAlignmentControl'

// Este componente é responsável por renderizar os controles específicos de cada tela do painel

type MachinePainelControlsProps = {
  currentScreen: AppScreen
}

function MachinePainelControlsComponent({
  currentScreen,
}: MachinePainelControlsProps) {
  switch (currentScreen) {
    case 'motors':
      return <MotorRodaControl />

    case 'alignment':
      return <LateralAlignmentControl />


    default:
      return <PainelControls />
  }
}

export const MachinePainelControls = memo(MachinePainelControlsComponent)