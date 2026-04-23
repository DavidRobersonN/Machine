import { BotaoDirectionPad } from '../../BotoesGenericos/BotaoDirectionPad'
import { useNavigationActions } from '../../../hooks/machine/useNavigationActions'

export function NavigationControl() {
  const {
    moveUp,
    moveLeft,
    selectCenter,
    moveRight,
    moveDown,
  } = useNavigationActions()

  return (
    <BotaoDirectionPad
      onClickUp={moveUp}
      onClickLeft={moveLeft}
      onClickCenter={selectCenter}
      onClickRight={moveRight}
      onClickDown={moveDown}
    />
  )
}