import { BottomControls } from '../components/PainelComponents/BottomControls/BottomControls'

import { ScreenMain } from '../components/ScreenGenerico/ScreenMain'
import { ScreenSidebar } from '../components/ScreenGenerico/ScreenSideBar'
import { ScreenStatusBar } from '../components/ScreenGenerico/ScreenStatusBar'

import { MachinePainelControls } from '../components/screens/MachinePainelControls'
import { MachineScreenRenderer } from '../components/screens/MachineScreenRender'

import { useHomeMachinePage } from '../hooks/machine/useHomeMachinePage'

import { PainelMachineTemplate } from '../templates/PainelMachineTemplate'

export function HomePage() {
  const {
    currentScreen,
    logs,
    availablePorts,
    selectedPort,
    arduinoConnected,
    speedMotorRoda,
    lateralMisalignmentCurrent,
    lateralMisalignmentHistory,
    sidebarProps,
    statusBarProps,
    bottomActions,
    led,
    wheelPositionDegrees,
    wheelTotalTurns,
    wheelDirection,
    wheelIsRunning,
    motorTurnsPerWheelTurn,

    goToScreen,
    handleListSerialPorts,
    handleSelectPort,
  } = useHomeMachinePage()

const shouldShowSidebar =
  currentScreen !== 'menu' &&
  currentScreen !== 'motors' &&
  currentScreen !== 'alignment' &&
  currentScreen !== 'serial' &&
  currentScreen !== 'logs'

  return (
    <PainelMachineTemplate
      screenMain={
        <ScreenMain
          sidebar={
            shouldShowSidebar ? <ScreenSidebar {...sidebarProps} /> : undefined
          }
          statusBar={<ScreenStatusBar {...statusBarProps} />}
          painelControls={
            <MachinePainelControls currentScreen={currentScreen} />
          }
        >
          <MachineScreenRenderer
            led={led}
            currentScreen={currentScreen}
            logs={logs}
            availablePorts={availablePorts}
            selectedPort={selectedPort}
            arduinoConnected={arduinoConnected}
            speedMotorRoda={speedMotorRoda}
            wheelPositionDegrees={wheelPositionDegrees}
            wheelTotalTurns={wheelTotalTurns}
            wheelDirection={wheelDirection}
            wheelIsRunning={wheelIsRunning}
            motorTurnsPerWheelTurn={motorTurnsPerWheelTurn}
            lateralMisalignmentCurrent={lateralMisalignmentCurrent}
            lateralMisalignmentHistory={lateralMisalignmentHistory}
            onSelectPort={handleSelectPort}
            onGoToScreen={goToScreen}
            onListSerialPorts={handleListSerialPorts}
          />
        </ScreenMain>
      }
      bottomControls={
        <BottomControls actions={bottomActions} />
      }
    />
  )
}