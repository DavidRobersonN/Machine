import { LedScreen } from './LedScreen/LedScreen'
import { LogsScreen } from './LogsScreen'
import { MenuScreen } from './MenuScreen'
import { SerialPortsScreen } from './SerialPortsScreen'
import { StartScreen } from './StartScreen'
import { MotorsScreen } from './MotorsScreen'
import type { AppScreen } from '../../types/navigation'

// Este componente é responsável por renderizar a tela principal do painel, exibindo o conteúdo de acordo 
// com a tela selecionada no menu lateral. Ele recebe as informações 
// necessárias para cada tela e as funções de controle como props, garantindo que a lógica de navegação e controle esteja centralizada aqui.

import type {
  MachineLog,
  SelectedSerialPortState,
  SerialPortInfo,
  ArduinoConnectionState,
  LedUiState,
} from '../../types/machine'

type MachineScreenRendererProps = {
  currentScreen: AppScreen
  logs: MachineLog[]
  availablePorts: SerialPortInfo[]
  selectedPort: SelectedSerialPortState
  arduinoConnected: ArduinoConnectionState
  speedMotorRoda: number
  led: LedUiState
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
  led,
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
        />
      )

    case 'led':
      return <LedScreen 
        led={led}
      />

    case 'motors':
      return (
        <MotorsScreen
          speedPercent={speedMotorRoda}
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