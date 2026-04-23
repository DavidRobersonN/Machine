import { useState } from 'react'
import { BottomControls } from '../components/PainelComponents/BottomControls/BottomControls'
import { PainelControls } from '../components/PainelComponents/PainelControls/PainelControls'
import { NavigationControl } from '../components/controls/NavigationControl/NavigationControl'
import { ScreenMain } from '../components/Screen/ScreenMain'
import { ScreenSidebar } from '../components/Screen/ScreenSideBar'
import { ScreenStatusBar } from '../components/Screen/ScreenStatusBar'
import { LedScreen } from '../components/screens/LedScreen'
import { LogsScreen } from '../components/screens/LogsScreen'
import { MenuScreen } from '../components/screens/MenuScreen'
import { SerialPortsScreen } from '../components/screens/SerialPortsScreen'
import { StartScreen } from '../components/screens/StartScreen'
import { useMachineContext } from '../context/MachineContext'
import { useMachineScreenData } from '../hooks/machine/useMachineScreenData'
import { PainelMachineTemplate } from '../templates/PainelMachineTemplate'
import type { AppScreen } from '../types/navigation'

export function HomePage() {
  const {
    logs,
    availablePorts,
    selectedPort,
    sidebarProps,
    statusBarProps,
  } = useMachineScreenData()

  const { sendCommand, dispatch } = useMachineContext()
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('start')

  function handleListSerialPorts() {
    sendCommand({ action: 'list_serial_ports' })
    setCurrentScreen('serial')
  }

  function handleSelectPort(port: string) {
    const success = sendCommand({
      action: 'select_serial_port',
      port,
    })

    if (success) {
      dispatch({
        type: 'SET_SELECTED_PORT',
        payload: port,
      })
    }
  }

  function handleClearLogs() {
    dispatch({ type: 'CLEAR_LOGS' })
  }

  function handleDisconnectPort() {
    sendCommand({ action: 'disconnect_serial_port' })
  }

  function renderCurrentScreen() {
    switch (currentScreen) {
      case 'start':
        return (
          <StartScreen onEnterMenu={() => setCurrentScreen('menu')} />
        )

      case 'menu':
        return (
          <MenuScreen
            onSelectLed={() => setCurrentScreen('led')}
            onSelectLogs={() => setCurrentScreen('logs')}
            onSelectSerial={handleListSerialPorts}
            onBack={() => setCurrentScreen('start')}
          />
        )

      case 'led':
        return (
          <LedScreen onBack={() => setCurrentScreen('menu')} />
        )

      case 'logs':
        return (
          <LogsScreen
            logs={logs}
            onBack={() => setCurrentScreen('menu')}
          />
        )

      case 'serial':
        return (
          <SerialPortsScreen
            ports={availablePorts}
            selectedPort={selectedPort}
            arduinoConnected={statusBarProps.arduinoConnection}
            onSelectPort={handleSelectPort}
            onDisconnect={handleDisconnectPort}
            onBack={() => setCurrentScreen('menu')}
          />
        )

      default:
        return null
    }
  }

  function getBottomActions() {
    switch (currentScreen) {
      case 'start':
        return [
          {
            label: 'Entrar no menu',
            onClick: () => setCurrentScreen('menu'),
            variant: 'green' as const,
          },
        ]

      case 'menu':
        return [
          {
            label: 'Listar Portas Seriais',
            onClick: handleListSerialPorts,
            variant: 'orange' as const,
          },
        ]

      case 'led':
        return [
          {
            label: 'Voltar ao menu',
            onClick: () => setCurrentScreen('menu'),
            variant: 'orange' as const,
          },
        ]

      case 'logs':
        return [
          {
            label: 'Limpar Logs',
            onClick: handleClearLogs,
            variant: 'red' as const,
          },
          {
            label: 'Voltar ao menu',
            onClick: () => setCurrentScreen('menu'),
            variant: 'orange' as const,
          },
        ]

      case 'serial':
        return [
          {
            label: 'Atualizar Portas',
            onClick: handleListSerialPorts,
            variant: 'orange' as const,
          },
          {
            label: 'Desconectar',
            onClick: handleDisconnectPort,
            variant: 'red' as const,
          },
          {
            label: 'Voltar ao menu',
            onClick: () => setCurrentScreen('menu'),
            variant: 'green' as const,
          },
        ]

      default:
        return []
    }
  }

  return (
    <PainelMachineTemplate
      screenMain={
        <ScreenMain
          sidebar={<ScreenSidebar {...sidebarProps} />}
          statusBar={<ScreenStatusBar {...statusBarProps} />}
        >
          {renderCurrentScreen()}
        </ScreenMain>
      }
      sideControls={
        <PainelControls
          directionPad={<NavigationControl />}
        />
      }
      bottomControls={
        <BottomControls actions={getBottomActions()} />
      }
    />
  )
}