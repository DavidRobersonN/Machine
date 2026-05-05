import { LedScreen } from './LedScreen/LedScreen'
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
  LedUiState,
  MisalignmentPoint,
  WheelDirection,
} from '../../types/machine'

// Este componente é responsável por renderizar a tela principal do painel,
// exibindo o conteúdo de acordo com a tela selecionada no menu lateral.
// Ele recebe as informações necessárias para cada tela e as funções de controle como props,
// garantindo que a lógica de navegação e controle esteja centralizada aqui.

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

  led: LedUiState

  lateralMisalignmentCurrent: number
  lateralMisalignmentHistory: MisalignmentPoint[]
  onSelectPort: (port: string) => void
  onGoToScreen: (screen: AppScreen) => void
  onListSerialPorts: () => void
}

export function MachineScreenRenderer({
  currentScreen,
  logs,
  availablePorts,
  selectedPort,
  arduinoConnected,
  speedMotorRoda,

  wheelPositionDegrees,
  wheelTotalTurns,
  wheelDirection,
  wheelIsRunning,
  motorTurnsPerWheelTurn,

  led,
  lateralMisalignmentCurrent,
  lateralMisalignmentHistory,
  onSelectPort,
  onGoToScreen,
  onListSerialPorts,
}: MachineScreenRendererProps) {
  switch (currentScreen) {
    case 'start':
      return <StartScreen />

    case 'menu':
      return (
        <MenuScreen
          onSelectLed={() => onGoToScreen('led')}
          onSelectLogs={() => onGoToScreen('logs')}
          onSelectSerial={onListSerialPorts}
          onSelectMotors={() => onGoToScreen('motors')}
          onSelectAlignment={() => onGoToScreen('alignment')}
        />
      )

    case 'led':
      return (
        <LedScreen
          led={led}
        />
      )

    case 'motors':
      return (
        <MotorsScreen
          speedPercent={speedMotorRoda}
          wheelPositionDegrees={wheelPositionDegrees}
          wheelTotalTurns={wheelTotalTurns}
          wheelDirection={wheelDirection}
          wheelIsRunning={wheelIsRunning}
          motorTurnsPerWheelTurn={motorTurnsPerWheelTurn}
        />
      )

    case 'alignment':
      return (
        <LateralAlignmentScreen
          value={lateralMisalignmentCurrent}
          history={lateralMisalignmentHistory}
        />
      )

    case 'logs':
      return (
        <LogsScreen logs={logs} />
      )

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