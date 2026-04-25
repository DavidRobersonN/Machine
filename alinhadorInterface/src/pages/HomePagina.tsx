import { useState } from 'react'

import { BottomControls } from '../components/PainelComponents/BottomControls/BottomControls'
import { PainelControls } from '../components/PainelComponents/PainelControls/PainelControls'
import { MotorRodaControl } from '../components/PainelComponents/Motors/MotorRodaControl'

import { ScreenMain } from '../components/ScreenGenerico/ScreenMain'
import { ScreenSidebar } from '../components/ScreenGenerico/ScreenSideBar'
import { ScreenStatusBar } from '../components/ScreenGenerico/ScreenStatusBar'

import { LedScreen } from '../components/screens/LedScreen'
import { LogsScreen } from '../components/screens/LogsScreen'
import { MenuScreen } from '../components/screens/MenuScreen'
import { SerialPortsScreen } from '../components/screens/SerialPortsScreen'
import { StartScreen } from '../components/screens/StartScreen'
import { MotorsScreen } from '../components/screens/MotorsScreen'

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

  const { state, sendCommand, dispatch } = useMachineContext()

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
          <StartScreen />
        )

      case 'menu':
        return (
          <MenuScreen
            onSelectLed={() => setCurrentScreen('led')}
            onSelectLogs={() => setCurrentScreen('logs')}
            onSelectSerial={handleListSerialPorts}
            onSelectMotors={() => setCurrentScreen('motors')}
          />
        )

      case 'led':
        return (
          <LedScreen />
        )

      case 'motors':
        return (
          <MotorsScreen
            speedPercent={state.speed_motor_roda}
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
            arduinoConnected={statusBarProps.arduinoConnection}
            onSelectPort={handleSelectPort}
          />
        )

      default:
        return null
    }
  }

  function getPainelControls() {
    switch (currentScreen) {
      case 'motors':
        return <MotorRodaControl />

      default:
        return <PainelControls />
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
            label: 'Voltar a tela Inicial',
            onClick: () => setCurrentScreen('start'),
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

      case 'motors':
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
          painelControls={getPainelControls()}
        >
          {renderCurrentScreen()}
        </ScreenMain>
      }

      bottomControls={
        <BottomControls actions={getBottomActions()} />
      }
    />
  )
}