import { LedControl } from '../components/PainelComponents/led/LedControl'
import { PainelControls } from '../components/PainelComponents/PainelControls/PainelControls'
import { ScreenMain } from '../components/Screen/ScreenMain'
import { PainelMachineTemplate } from '../templates/PainelMachineTemplate'
import { NavigationControl } from '../components/controls/NavigationControl/NavigationControl'
import { SerialPortList } from '../components/PainelComponents/Serial/SerialPortList'
import { useScreenMainData } from '../hooks/machine/useScreenMainData'

export function HomePage() {

  const screenMainData = useScreenMainData()

  return (
    <PainelMachineTemplate
      screenMain={<ScreenMain {...screenMainData} />}

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