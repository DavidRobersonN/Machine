import { useState } from 'react'

import { BottomControls } from '../components/PainelComponents/BottomControls/BottomControls'
import { PainelControls } from '../components/PainelComponents/PainelControls/PainelControls'
import { NavigationControl } from '../components/controls/NavigationControl/NavigationControl'

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
  /**
   * Hook responsável por preparar os dados que a tela precisa exibir.
   *
   * Ele centraliza informações como:
   * - logs da máquina
   * - portas seriais disponíveis
   * - porta atualmente selecionada
   * - dados da sidebar
   * - dados da barra de status
   */
  const {
    logs,
    availablePorts,
    selectedPort,
    sidebarProps,
    statusBarProps,
  } = useMachineScreenData()

  /**
   * Contexto global da máquina.
   *
   * sendCommand:
   * Envia comandos para o backend/WebSocket.
   *
   * dispatch:
   * Atualiza o estado global da aplicação.
   */
 const { state, sendCommand, dispatch } = useMachineContext()

  /**
   * Estado local que controla qual tela está sendo exibida
   * dentro do painel principal.
   *
   * Começa na tela inicial.
   */
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('start')

  /**
   * Solicita ao backend a lista de portas seriais disponíveis.
   *
   * Depois disso, troca a tela atual para a tela de seleção
   * de portas seriais.
   */
  function handleListSerialPorts() {
    sendCommand({ action: 'list_serial_ports' })
    setCurrentScreen('serial')
  }

  /**
   * Seleciona uma porta serial.
   *
   * Primeiro envia o comando para o backend.
   * Se o envio der certo, atualiza também o estado global
   * com a porta escolhida.
   */
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

  /**
   * Limpa os logs armazenados no estado global.
   */
  function handleClearLogs() {
    dispatch({ type: 'CLEAR_LOGS' })
  }

  /**
   * Envia um comando para desconectar a porta serial atual.
   */
  function handleDisconnectPort() {
    sendCommand({ action: 'disconnect_serial_port' })
  }

  /**
   * Decide qual componente de tela deve aparecer no painel principal.
   *
   * A tela exibida depende do valor de currentScreen.
   */
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
            onSelectMotors={() => setCurrentScreen('motors')}
            onBack={() => setCurrentScreen('start')}
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
          <LogsScreen logs={logs}/>
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

  /**
   * Retorna os botões inferiores do painel.
   *
   * Cada tela pode ter botões diferentes.
   * Exemplo:
   * - na tela inicial aparece "Entrar no menu"
   * - na tela de logs aparece "Limpar Logs"
   * - na tela serial aparecem ações para atualizar, desconectar e voltar
   */
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
      /**
       * Área principal da máquina.
       *
       * Aqui montamos a tela principal com:
       * - sidebar lateral
       * - barra de status
       * - conteúdo dinâmico da tela atual
       */
      screenMain={
        <ScreenMain
          sidebar={<ScreenSidebar {...sidebarProps} />}
          statusBar={<ScreenStatusBar {...statusBarProps} />}
        >
          {renderCurrentScreen()}
        </ScreenMain>
      }

      /**
       * Controles laterais do painel.
       *
       * Por enquanto recebe o NavigationControl,
       * que representa o controle direcional.
       */
      sideControls={
        <PainelControls
          directionPad={<NavigationControl />}
        />
      }

      /**
       * Controles inferiores do painel.
       *
       * Os botões mudam conforme a tela atual.
       */
      bottomControls={
        <BottomControls actions={getBottomActions()} />
      }
    />
  )
}