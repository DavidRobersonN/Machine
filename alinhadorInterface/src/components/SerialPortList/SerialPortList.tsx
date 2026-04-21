import { useMachineContext } from '../../context/MachineContext'
import { BotaoQuadradoVerde } from '../Botao/BotaoQuadradoVerde'


export function SerialPortList() {
    const { sendCommand } = useMachineContext()

    function handlePortDisponivel() {
        sendCommand({
            action: 'list_serial_ports'
        })
    }

    return (
        <div className="led-buttons">
            <BotaoQuadradoVerde
            nome="Listar Portas Seriais"
            onClick={handlePortDisponivel}
            />
        </div>
    )
}