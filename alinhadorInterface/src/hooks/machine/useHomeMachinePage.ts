import { useCallback, useMemo, useState } from 'react'

import { useMachineContext } from '../../context/useMachineContext'
import { useMachineScreenData } from './useMachineScreenData'

import type { AppScreen } from '../../types/navigation'

// Este hook é responsável por gerenciar a lógica da página principal da máquina,
// que inclui a navegação entre telas, gerenciamento de ações comuns (como listar
// portas seriais, limpar logs, etc) e fornecer os dados necessários para renderizar as telas.

export function useHomeMachinePage() {
  const {
    logs,
    availablePorts,
    selectedPort,
    sidebarProps,
    statusBarProps,
  } = useMachineScreenData()

  const { state, sendCommand, dispatch } = useMachineContext()

  const [currentScreen, setCurrentScreen] = useState<AppScreen>('start')

  const goToScreen = useCallback((screen: AppScreen) => {
    setCurrentScreen(screen)
  }, [])

  const handleListSerialPorts = useCallback(() => {
    sendCommand({ action: 'list_serial_ports' })
    setCurrentScreen('serial')
  }, [sendCommand])

  const handleSelectPort = useCallback(
    (port: string) => {
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
    },
    [sendCommand, dispatch],
  )

  const handleClearLogs = useCallback(() => {
    dispatch({ type: 'CLEAR_LOGS' })
  }, [dispatch])

  const handleDisconnectPort = useCallback(() => {
    sendCommand({ action: 'disconnect_serial_port' })

    dispatch({
      type: 'SET_SELECTED_PORT',
      payload: null,
    })
  }, [sendCommand, dispatch])


  const bottomActions = useMemo(() => {
    return getBottomActions({
      currentScreen,
      goToScreen,
      handleClearLogs,
      handleListSerialPorts,
      handleDisconnectPort,
    })
  }, [
    currentScreen,
    goToScreen,
    handleClearLogs,
    handleListSerialPorts,
    handleDisconnectPort,
  ])

  return {
    currentScreen,
    logs,
    availablePorts,
    selectedPort,
    sidebarProps,
    statusBarProps,
    led: state.led,
    arduinoConnected: statusBarProps.arduinoConnection,
    speedMotorRoda: state.speed_motor_roda,
    lateralMisalignmentCurrent: state.lateral_misalignment_current,
    lateralMisalignmentHistory: state.lateral_misalignment_history,
    wheelPositionDegrees: state.wheel_position_degrees,
    wheelTotalTurns: state.wheel_total_turns,
    wheelDirection: state.wheel_direction,
    wheelIsRunning: state.wheel_is_running,
    motorTurnsPerWheelTurn: state.motor_turns_per_wheel_turn,
    bottomActions,
    goToScreen,
    handleListSerialPorts,
    handleSelectPort,
    handleClearLogs,
    handleDisconnectPort,
  }
}

type GetBottomActionsParams = {
  currentScreen: AppScreen
  goToScreen: (screen: AppScreen) => void
  handleClearLogs: () => void
  handleListSerialPorts: () => void
  handleDisconnectPort: () => void
}

function getBottomActions({
  currentScreen,
  goToScreen,
  handleClearLogs,
  handleListSerialPorts,
  handleDisconnectPort,
  
}: GetBottomActionsParams) {
  switch (currentScreen) {
    case 'start':
      return [
        {
          label: 'Entrar no menu',
          onClick: () => goToScreen('menu'),
          variant: 'green' as const,
        },
      ]

    case 'menu':
      return [
        {
          label: 'Voltar a tela Inicial',
          onClick: () => goToScreen('start'),
          variant: 'orange' as const,
        },
      ]

    case 'motors':
      return [
        {
          label: 'Voltar ao menu',
          onClick: () => goToScreen('menu'),
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
          onClick: () => goToScreen('menu'),
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
          onClick: () => goToScreen('menu'),
          variant: 'green' as const,
        },
      ]

    case 'alignment':
    case 'wheelMap':
    case 'spokeTension':
      return [
        {
          label: 'Voltar ao menu',
          onClick: () => goToScreen('menu'),
          variant: 'orange' as const,
        },
      ]

    default:
      return []
  }
}
