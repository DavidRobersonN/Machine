import { LedControl } from '../components/PainelComponents/led/LedControl'
import { PainelControls } from '../components/PainelComponents/PainelControls/PainelControls'
import { ScreenMain } from '../components/PainelComponents/Screen/ScreenMain/ScreenMain'
import { ScreenStatusBar } from '../components/PainelComponents/Screen/ScreenStatusBar/ScreenStatusBar'
import { PainelMachineTemplate } from '../templates/PainelMachineTemplate'
import { useMachineContext } from '../context/MachineContext'
import { NavigationControl } from '../components/controls/NavigationControl/NavigationControl'
import { SerialPortList } from '../components/Serial/SerialPortList'

export function HomePage() {
  const { state } = useMachineContext()

  return (
    <PainelMachineTemplate
      screenMain={<ScreenMain />}

      screenStatusBar={
        <ScreenStatusBar
          connected={state.connected}
          led={state.led}
        />
      }

      screenPainelControls={
        <PainelControls
          directionPad={<NavigationControl />}
        />
      }

      botaoled={<LedControl />}

      botaoSerialPortList={<SerialPortList />}
    />
  )
}