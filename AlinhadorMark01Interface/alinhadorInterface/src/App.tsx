import { PainelMachine } from './components/Painel/PainelMachine'
import { MachineProvider } from './context/MachineContext'

export default function App() {
  return (
    <MachineProvider>
        <PainelMachine />
    </MachineProvider>
  )
}