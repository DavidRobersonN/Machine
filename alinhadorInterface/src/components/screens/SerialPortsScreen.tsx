import type {
  SelectedSerialPortState,
  SerialPortInfo,
} from '../../types/machine/machine'

type SerialPortsScreenProps = {
  ports: SerialPortInfo[]
  selectedPort: SelectedSerialPortState
  arduinoConnected: 'Conectado' | 'Desconectado'
  onSelectPort: (port: string) => void
}

export function SerialPortsScreen({
  ports,
  selectedPort,
  arduinoConnected,
  onSelectPort,
}: SerialPortsScreenProps) {
  return (
    <div className="screen-page">
      <h2 className="screen-page-title">Portas COM</h2>

      <p className="screen-page-text">
        Selecione a porta serial do Arduino.
      </p>

      <p className="screen-page-text">
        Porta selecionada: {selectedPort ?? 'Nenhuma'}
      </p>

      <p className="screen-page-text">
        Arduino: {arduinoConnected}
      </p>

      <div className="serial-ports-box">
        {ports.length === 0 ? (
          <p className="screen-page-text">Nenhuma porta encontrada.</p>
        ) : (
          <div className="serial-port-list">
            {ports.map((port) => {
              const isSelected = selectedPort === port.device

              return (
                <button
                  key={port.device}
                  type="button"
                  className={`serial-port-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectPort(port.device)}
                >
                  <span className="serial-port-device">{port.device}</span>
                  <span className="serial-port-description">
                    {port.description || 'Sem descrição'}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}