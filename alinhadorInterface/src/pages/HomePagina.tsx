import { LedControl } from '../components/PainelComponents/led/LedControl'
import { PainelControls } from '../components/PainelComponents/PainelControls/PainelControls'
import { ScreenMain } from '../components/Screen/ScreenMain'
import { ScreenSidebar } from '../components/Screen/ScreenSideBar'
import { ScreenStatusBar } from '../components/Screen/ScreenStatusBar'
import { PainelMachineTemplate } from '../templates/PainelMachineTemplate'
import { NavigationControl } from '../components/controls/NavigationControl/NavigationControl'
import { SerialPortList } from '../components/PainelComponents/Serial/SerialPortList'
import { useMachineScreenData } from '../hooks/machine/useMachineScreenData'

export function HomePage() {
  const { logs, sidebarProps, statusBarProps } = useMachineScreenData()

  return (
    <PainelMachineTemplate
      screenMain={
        <ScreenMain
          logs={logs}
          sidebar={<ScreenSidebar {...sidebarProps} />}
          statusBar={<ScreenStatusBar {...statusBarProps} />}
        />
      }
      sideControls={
        <PainelControls
          directionPad={<NavigationControl />}
        />
      }
      bottomControls={
        <>
          <LedControl />
          <SerialPortList />
        </>
      }
    />
  )
}