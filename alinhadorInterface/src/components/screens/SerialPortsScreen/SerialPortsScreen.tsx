import { useState } from 'react'

import { useMachineContext } from '../../../context/MachineContext'

import type {
  SelectedSerialPortState,
  SerialPortInfo,
} from '../../../types/machine/machine'

import './SerialPortsScreen.css'

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
  const { state, sendCommand, dispatch } = useMachineContext()

  const [command, setCommand] = useState('')

  const isWebSocketConnected = state.connected
  const isArduinoConnected = arduinoConnected === 'Conectado'

  function handleListSerialPorts() {
    sendCommand({
      action: 'list_serial_ports',
    })
  }

  function handleDisconnectSerialPort() {
    sendCommand({
      action: 'disconnect_serial_port',
    })
  }

  function handleSendCommand() {
    const trimmedCommand = command.trim()

    if (!trimmedCommand) {
      return
    }

    sendCommand({
      action: 'serial_send_command',
      command: trimmedCommand,
    })

    setCommand('')
  }

  function handleSyncMachineConfig() {
    sendCommand({
      action: 'sync_machine_config',
    })
  }

  function handleClearLogs() {
    dispatch({
      type: 'CLEAR_LOGS',
    })
  }

  return (
    <div className="screen-page serial-ports-screen">
      <header className="serial-monitor-header">
        <div>
          <span className="serial-monitor-kicker">Comunicacao</span>

          <h2 className="screen-page-title">Monitor serial</h2>

          <p className="screen-page-text">
            Conecte o Arduino, envie comandos manuais e sincronize as
            configuracoes salvas no Django Admin.
          </p>
        </div>

        <div className="serial-monitor-status-box">
          <div className="serial-monitor-status-item">
            <span>WebSocket</span>

            <strong className={isWebSocketConnected ? 'status-ok' : 'status-error'}>
              {isWebSocketConnected ? 'Conectado' : 'Desconectado'}
            </strong>
          </div>

          <div className="serial-monitor-status-item">
            <span>Arduino</span>

            <strong className={isArduinoConnected ? 'status-ok' : 'status-error'}>
              {arduinoConnected}
            </strong>
          </div>

          <div className="serial-monitor-status-item">
            <span>Porta atual</span>

            <strong>{selectedPort ?? 'Nenhuma'}</strong>
          </div>
        </div>
      </header>

      <section className="serial-monitor-toolbar">
        <button
          type="button"
          className="serial-monitor-button primary"
          onClick={handleListSerialPorts}
        >
          Atualizar portas
        </button>

        <button
          type="button"
          className="serial-monitor-button danger"
          onClick={handleDisconnectSerialPort}
        >
          Desconectar
        </button>

        <button
          type="button"
          className="serial-monitor-button success"
          onClick={handleSyncMachineConfig}
        >
          Enviar configuracao
        </button>
      </section>

      <section className="serial-monitor-grid">
        <article className="serial-monitor-card serial-monitor-card--ports">
          <div className="serial-monitor-card-header">
            <div>
              <span className="serial-monitor-card-kicker">Portas disponiveis</span>
              <h3>Portas COM</h3>
            </div>

            <span className="serial-monitor-count">
              {ports.length}
            </span>
          </div>

          <div className="serial-ports-box">
            {ports.length === 0 ? (
              <div className="serial-monitor-empty">
                <strong>Nenhuma porta encontrada</strong>

                <p>
                  Clique em "Atualizar portas" para buscar dispositivos
                  conectados.
                </p>
              </div>
            ) : (
              <div className="serial-port-list">
                {ports.map((port) => {
                  const isSelected = selectedPort === port.device

                  return (
                    <button
                      key={port.device}
                      type="button"
                      className={`serial-port-item ${
                        isSelected ? 'selected' : ''
                      }`}
                      onClick={() => onSelectPort(port.device)}
                    >
                      <div className="serial-port-item-header">
                        <span className="serial-port-device">
                          {port.device}
                        </span>

                        {isSelected && (
                          <span className="serial-port-selected-badge">
                            Selecionada
                          </span>
                        )}
                      </div>

                      <span className="serial-port-description">
                        {port.description || 'Sem descricao'}
                      </span>

                      <span className="serial-port-hwid">
                        {port.hwid || 'Sem HWID'}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </article>

        <article className="serial-monitor-card serial-monitor-card--command">
          <div className="serial-monitor-card-header">
            <div>
              <span className="serial-monitor-card-kicker">Comando manual</span>
              <h3>Enviar comando</h3>
            </div>
          </div>

          <p className="serial-monitor-help-text">
            Digite exatamente o comando que o Arduino espera receber.
          </p>

          <div className="serial-command-box">
            <input
              type="text"
              value={command}
              className="serial-command-input"
              placeholder="Ex: LED_ON"
              onChange={(event) => setCommand(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSendCommand()
                }
              }}
            />

            <button
              type="button"
              className="serial-monitor-button success"
              onClick={handleSendCommand}
            >
              Enviar
            </button>
          </div>

          <div className="serial-command-examples">
            <button
              type="button"
              onClick={() => setCommand('LED_ON')}
            >
              LED_ON
            </button>

            <button
              type="button"
              onClick={() => setCommand('LED_OFF')}
            >
              LED_OFF
            </button>

            <button
              type="button"
              onClick={() => setCommand('CONFIG_MOTOR_STATUS')}
            >
              CONFIG_MOTOR_STATUS
            </button>

            <button
              type="button"
              onClick={() => setCommand('MOTOR_RODA_SET_ZERO')}
            >
              MOTOR_RODA_SET_ZERO
            </button>
          </div>

          <div className="serial-command-config-box">
            <div>
              <h4>Configuracao Django</h4>

              <p>
                Envia para o Arduino os valores salvos no Django Admin, como
                passos por volta, velocidade maxima e aceleracao.
              </p>
            </div>

            <button
              type="button"
              className="serial-monitor-button success"
              onClick={handleSyncMachineConfig}
            >
              Sincronizar
            </button>
          </div>
        </article>
      </section>

      <section className="serial-monitor-logs-card">
        <div className="serial-monitor-logs-header">
          <div>
            <span className="serial-monitor-card-kicker">Historico</span>
            <h3>Logs seriais</h3>
          </div>

          <button
            type="button"
            className="serial-monitor-button small"
            onClick={handleClearLogs}
          >
            Limpar logs
          </button>
        </div>

        <div className="serial-log-list">
          {state.logs.length === 0 ? (
            <p className="serial-log-empty">
              Nenhuma mensagem enviada ou recebida ainda.
            </p>
          ) : (
            state.logs.map((log, index) => (
              <div
                key={`${log.direction}-${index}-${log.message}`}
                className={`serial-log-line ${log.direction}`}
              >
                <span>
                  {log.direction === 'sent' ? 'Enviado' : 'Recebido'}
                </span>

                <p>{log.message}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
