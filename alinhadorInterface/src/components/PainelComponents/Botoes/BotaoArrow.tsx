import { BotaoDirectionPad } from '../../BotoesGenericos/BotaoDirectionPad'

export function Clique() {
  function handleUp() {
    console.log('Clicou para cima')
  }

  function handleLeft() {
    console.log('Clicou para esquerda')
  }

  function handleCenter() {
    console.log('Clicou no centro')
  }

  function handleRight() {
    console.log('Clicou para direita')
  }

  function handleDown() {
    console.log('Clicou para baixo')
  }

  return (
    <BotaoDirectionPad
      onClickUp={handleUp}
      onClickLeft={handleLeft}
      onClickCenter={handleCenter}
      onClickRight={handleRight}
      onClickDown={handleDown}
    />
  )
}