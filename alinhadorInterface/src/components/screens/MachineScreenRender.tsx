import { memo, useCallback } from 'react'

import { LogsScreen } from './LogsScreen/LogsScreen'
import { MenuScreen } from './MenuScreen/MenuScreen'
import { SerialPortsScreen } from './SerialPortsScreen/SerialPortsScreen'
import { StartScreen } from './StartScreen/StartScreen'
import { MotorsScreen } from '../screens/MotorsScreen/MotorsScreen'
import { LateralAlignmentScreen } from './LateralAlignmentScreen/LateralAlignmentScreen'

import type { AppScreen } from '../../types/navigation'

import type {
  MachineLog,
  SelectedSerialPortState,
  SerialPortInfo,
  ArduinoConnectionState,
  MisalignmentPoint,
  WheelDirection,
} from '../../types/machine'

// Este componente é responsável por renderizar a tela principal do painel,
// exibindo o conteúdo de acordo com a tela selecionada no menu lateral.
//
// Importante:
// Usamos memo com comparação personalizada para evitar que telas paradas,
// como StartScreen e MenuScreen, fiquem renderizando toda hora por causa
// de atualizações de sensor, motor ou logs.

type MachineScreenRendererProps = {
  currentScreen: AppScreen
  logs: MachineLog[]
  availablePorts: SerialPortInfo[]
  selectedPort: SelectedSerialPortState
  arduinoConnected: ArduinoConnectionState
  speedMotorRoda: number

  wheelPositionDegrees: number
  wheelTotalTurns: number
  wheelDirection: WheelDirection
  wheelIsRunning: boolean
  motorTurnsPerWheelTurn: number

  lateralMisalignmentCurrent: number
  lateralMisalignmentHistory: MisalignmentPoint[]
  onSelectPort: (port: string) => void
  onGoToScreen: (screen: AppScreen) => void
  onListSerialPorts: () => void
}

function MachineScreenRendererComponent(props: MachineScreenRendererProps) {
  const {
    currentScreen,
    logs,
    availablePorts,
    selectedPort,
    arduinoConnected,
    lateralMisalignmentCurrent,
    lateralMisalignmentHistory,
    onSelectPort,
    onGoToScreen,
    onListSerialPorts,
  } = props

  const handleSelectLogs = useCallback(() => {
    onGoToScreen('logs')
  }, [onGoToScreen])

  const handleSelectMotors = useCallback(() => {
    onGoToScreen('motors')
  }, [onGoToScreen])

  const handleSelectAlignment = useCallback(() => {
    onGoToScreen('alignment')
  }, [onGoToScreen])

  switch (currentScreen) {
    case 'start':
      return <StartScreen />

    case 'menu':
      return (
        <MenuScreen
          onSelectLogs={handleSelectLogs}
          onSelectSerial={onListSerialPorts}
          onSelectMotors={handleSelectMotors}
          onSelectAlignment={handleSelectAlignment}
        />
      )

    case 'motors':
      return <MotorsScreen />

    case 'alignment':
      return (
        <LateralAlignmentScreen
          value={lateralMisalignmentCurrent}
          history={lateralMisalignmentHistory}
        />
      )

    case 'logs':
      return <LogsScreen logs={logs} />

    case 'serial':
      return (
        <SerialPortsScreen
          ports={availablePorts}
          selectedPort={selectedPort}
          arduinoConnected={arduinoConnected}
          onSelectPort={onSelectPort}
        />
      )

    default:
      return null
  }
}

function areMachineScreenRendererPropsEqual(
  previousProps: MachineScreenRendererProps,
  nextProps: MachineScreenRendererProps,
) {
  if (previousProps.currentScreen !== nextProps.currentScreen) {
    return false
  }

  switch (nextProps.currentScreen) {
    case 'start':
      return true

    case 'menu':
      return (
        previousProps.onGoToScreen === nextProps.onGoToScreen &&
        previousProps.onListSerialPorts === nextProps.onListSerialPorts
      )

    case 'motors':
      return true

    case 'alignment':
      return (
        previousProps.lateralMisalignmentCurrent ===
          nextProps.lateralMisalignmentCurrent &&
        previousProps.lateralMisalignmentHistory ===
          nextProps.lateralMisalignmentHistory
      )

    case 'logs':
      return previousProps.logs === nextProps.logs

    case 'serial':
      return (
        previousProps.availablePorts === nextProps.availablePorts &&
        previousProps.selectedPort === nextProps.selectedPort &&
        previousProps.arduinoConnected === nextProps.arduinoConnected &&
        previousProps.onSelectPort === nextProps.onSelectPort
      )

    default:
      return true
  }
}

export const MachineScreenRenderer = memo(
  MachineScreenRendererComponent,
  areMachineScreenRendererPropsEqual,
)