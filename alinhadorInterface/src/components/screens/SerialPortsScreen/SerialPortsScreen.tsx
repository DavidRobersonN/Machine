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
          <h2 className="screen-page-title">Monitor Serial</h2>

          <p className="screen-page-text">
            Monitore a porta serial do Arduino e envie comandos manualmente.
          </p>
        </div>

        <div className="serial-monitor-status-box">
          <div className="serial-monitor-status-item">
            <span>WebSocket</span>
            <strong className={state.connected ? 'status-ok' : 'status-error'}>
              {state.connected ? 'Conectado' : 'Desconectado'}
            </strong>
          </div>

          <div className="serial-monitor-status-item">
            <span>Arduino</span>
            <strong
              className={
                arduinoConnected === 'Conectado' ? 'status-ok' : 'status-error'
              }
            >
              {arduinoConnected}
            </strong>
          </div>

          <div className="serial-monitor-status-item">
            <span>Porta</span>
            <strong>{selectedPort ?? 'Nenhuma'}</strong>
          </div>
        </div>
      </header>

      <section className="serial-monitor-actions">
        <button
          type="button"
          className="serial-monitor-button"
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
      </section>

      <section className="serial-monitor-grid">
        <div className="serial-monitor-card">
          <h3>Portas COM</h3>

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
                      className={`serial-port-item ${
                        isSelected ? 'selected' : ''
                      }`}
                      onClick={() => onSelectPort(port.device)}
                    >
                      <span className="serial-port-device">{port.device}</span>

                      <span className="serial-port-description">
                        {port.description || 'Sem descrição'}
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
        </div>

        <div className="serial-monitor-card">
          <h3>Enviar comando</h3>

          <p className="screen-page-text">
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
              className="serial-monitor-button primary"
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
              onClick={() => setCommand('MOTOR_RODA_SET_ZERO')}
            >
              MOTOR_RODA_SET_ZERO
            </button>
          </div>

          <div className="serial-command-config-box">
            <h4>Configuração Django</h4>

            <button
              type="button"
              className="serial-monitor-button primary"
              onClick={handleSyncMachineConfig}
            >
              Enviar configurações para Arduino
            </button>
          </div>
        </div>
      </section>

      <section className="serial-monitor-logs-card">
        <div className="serial-monitor-logs-header">
          <h3>Logs seriais</h3>

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