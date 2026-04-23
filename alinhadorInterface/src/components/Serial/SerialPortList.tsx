import { BotaoQuadradoLaranja } from '../../components/BotoesGenericos/BotaoQuadradoLaranja'
import { useSerialPortActions } from '../../hooks/machine/useSerialPortActions'

export function SerialPortList() {
  const { listAvailableSerialPorts } = useSerialPortActions()

  return (
    <BotaoQuadradoLaranja
      nome="Listar Portas Seriais"
      onClick={listAvailableSerialPorts}
    />
  )
}