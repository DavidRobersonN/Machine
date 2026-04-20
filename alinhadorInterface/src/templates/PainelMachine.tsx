import { Container } from '../components/Container/Container'
import { PainelMachine } from '../components/Painel/PainelMachine'

type MainTemplateProps = {
  children: React.ReactNode
}

export function MainTemplate({ children }: MainTemplateProps) {
  return (
    <Container>
      <PainelMachine>{children}</PainelMachine>
    </Container>
  )
}