import { useMachineContext } from '../../../context/MachineContext'
import { BotaoQuadradoLaranja } from '../../BotoesGenericos/BotaoQuadradoLaranja'

export function SerialPortList() {
    const { sendCommand } = useMachineContext()

    function handlePortDisponivel() {
        sendCommand({
            action: 'list_serial_ports'
        })
    }

    return (
        
            <BotaoQuadradoLaranja
            nome="Listar Portas Seriais"
            onClick={handlePortDisponivel}
            />
    )
}