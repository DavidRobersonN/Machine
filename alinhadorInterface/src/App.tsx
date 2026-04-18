import { HomePage } from './pages/HomePagina'
import { MachineProvider } from './context/MachineContext'

export default function App() {
  return (
    <MachineProvider>
      <HomePage/>
    </MachineProvider>
  )
}