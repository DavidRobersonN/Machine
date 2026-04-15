import { Container } from '../../components/Container'
//Declarando o tipo das Props aceitas
type MainTemplateProps = {
  children: React.ReactNode;
};

export function MainTemplate({ children }: MainTemplateProps) {
  return (
    <Container>
      {children}
    </Container>
  );
}