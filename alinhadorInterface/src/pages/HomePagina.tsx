import { LedControl } from '../components/PainelComponents/led/LedControl'
import { PainelControls } from '../components/PainelComponents/PainelControls/PainelControls'
import { ScreenMain } from '../components/Screen/ScreenMain'
import { ScreenStatusBar } from '../components/Screen/ScreenStatusBar'
import { PainelMachineTemplate } from '../templates/PainelMachineTemplate'
import { useMachineContext } from '../context/MachineContext'
import { NavigationControl } from '../components/controls/NavigationControl/NavigationControl'
import { SerialPortList } from '../components/PainelComponents/Serial/SerialPortList'
import { useScreenMainData } from '../hooks/machine/useScreenMainData'

export function HomePage() {
  const { state } = useMachineContext()
  const screenMainData = useScreenMainData()

  return (
    <PainelMachineTemplate
      screenMain={<ScreenMain {...screenMainData} />}
      screenStatusBar={
        <ScreenStatusBar
          connected={state.connected}
          led={state.led}
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