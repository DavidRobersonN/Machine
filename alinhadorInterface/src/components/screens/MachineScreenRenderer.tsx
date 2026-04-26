import { LedScreen } from './LedScreen'
import { LogsScreen } from './LogsScreen'
import { MenuScreen } from './MenuScreen'
import { SerialPortsScreen } from './SerialPortsScreen'
import { StartScreen } from './StartScreen'
import { MotorsScreen } from './MotorsScreen'

import type { AppScreen } from '../../types/navigation'
import type {
  MachineLog,
  SelectedSerialPortState,
  SerialPortInfo,
  ArduinoConnectionState,
} from '../../types/machine'

type MachineScreenRendererProps = {
  currentScreen: AppScreen
  logs: MachineLog[]
  availablePorts: SerialPortInfo[]
  selectedPort: SelectedSerialPortState
  arduinoConnected: ArduinoConnectionState
  speedMotorRoda: number
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
      return <LedScreen />

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