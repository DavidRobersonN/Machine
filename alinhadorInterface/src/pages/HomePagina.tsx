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
    sidebarProps,
    statusBarProps,
    bottomActions,
    led,


    goToScreen,
    handleListSerialPorts,
    handleSelectPort,
  } = useHomeMachinePage()

  return (
    <PainelMachineTemplate
      screenMain={
        <ScreenMain
          sidebar={<ScreenSidebar {...sidebarProps} />}
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