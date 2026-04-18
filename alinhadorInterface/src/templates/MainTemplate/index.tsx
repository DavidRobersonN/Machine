import { Container } from '../../components/Container';
import { PainelMachine } from '../../components/Painel/PainelMachine';

//Declarando o tipo das Props aceitas
type MainTemplateProps = {
  children: React.ReactNode;
};

export function MainTemplate({ children }: MainTemplateProps) {
  return (
    <>
      <Container>
        <PainelMachine>
          {children}
        </PainelMachine>
      </Container>
    </>
  );
}
