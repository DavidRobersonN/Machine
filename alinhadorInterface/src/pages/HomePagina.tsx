import { Led } from '../components/PainelComponents/led/Led'
import { PainelControls } from '../components/PainelComponents/PainelControls/PainelControls'
import { ScreenMain } from '../components/PainelComponents/Screen/ScreenMain/ScreenMain'
import { ScreenStatusBar } from '../components/PainelComponents/Screen/ScreenStatusBar/ScreenStatusBar'
import { PainelMachineTemplate } from '../templates/PainelMachineTemplate'
import { SerialPortList } from '../components/PainelComponents/Botoes/SerialPortList'

export function HomePage() {
  return (
        <PainelMachineTemplate
        screenMain={<ScreenMain />}
        screenStatusBar={<ScreenStatusBar />}
        screenPainelControls={<PainelControls />}
        botaoled={<Led />}
        botaoSerialPortList={<SerialPortList />}
      />
  )
}