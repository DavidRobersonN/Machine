import { HomePage } from './pages/HomePagina'
import { MachineProvider } from './context/MachineContext'
import {Container} from './components/Container/Container'

export default function App() {
  return (
    <MachineProvider>
      <Container>
        <HomePage/>
      </Container>
    </MachineProvider>
  )
}