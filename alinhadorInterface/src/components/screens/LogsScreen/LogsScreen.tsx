import { useMemo, useState } from 'react'

import { useMachineContext } from '../../../context/useMachineContext'
import { ScreenLogs } from '../../ScreenGenerico/ScreenLogs'
import type { MachineLog } from '../../../types/machine/machine'

import './LogsScreen.css'

type LogsScreenProps = {
  logs: MachineLog[]
}

type LogFilter = 'all' | 'sent' | 'received' | 'error'

function isErrorLog(message: string) {
  const normalizedMessage = message.toLowerCase()

  return (
    normalizedMessage.includes('erro') ||
    normalizedMessage.includes('error') ||
    normalizedMessage.includes('falha') ||
    normalizedMessage.includes('desconectado') ||
    normalizedMessage.includes('comando_desconhecido')
  )
}

export function LogsScreen({ logs }: LogsScreenProps) {
  const { dispatch } = useMachineContext()

  const [activeFilter, setActiveFilter] = useState<LogFilter>('all')

  const sentLogs = logs.filter((log) => log.direction === 'sent').length
  const receivedLogs = logs.filter((log) => log.direction === 'received').length
  const errorLogs = logs.filter((log) => isErrorLog(log.message)).length

  const filteredLogs = useMemo(() => {
    if (activeFilter === 'sent') {
      return logs.filter((log) => log.direction === 'sent')
    }

    if (activeFilter === 'received') {
      return logs.filter((log) => log.direction === 'received')
    }

    if (activeFilter === 'error') {
      return logs.filter((log) => isErrorLog(log.message))
    }

    return logs
  }, [activeFilter, logs])

  function handleClearLogs() {
    dispatch({
      type: 'CLEAR_LOGS',
    })
  }

  return (
    <div className="screen-page logs-screen">
      <header className="logs-screen-header">
        <div>
          <span className="logs-screen-kicker">Histórico do sistema</span>

          <h2 className="screen-page-title">Logs</h2>

          <p>
            Acompanhe comandos enviados, respostas recebidas e eventos de
            comunicação entre interface, backend e Arduino.
          </p>
        </div>
      </header>

      <section className="logs-screen-summary">
        <button
          type="button"
          className={`logs-summary-card ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          <span>Total</span>
          <strong>{logs.length}</strong>
        </button>

        <button
          type="button"
          className={`logs-summary-card sent ${
            activeFilter === 'sent' ? 'active' : ''
          }`}
          onClick={() => setActiveFilter('sent')}
        >
          <span>Enviados</span>
          <strong>{sentLogs}</strong>
        </button>

        <button
          type="button"
          className={`logs-summary-card received ${
            activeFilter === 'received' ? 'active' : ''
          }`}
          onClick={() => setActiveFilter('received')}
        >
          <span>Recebidos</span>
          <strong>{receivedLogs}</strong>
        </button>

        <button
          type="button"
          className={`logs-summary-card error ${
            activeFilter === 'error' ? 'active' : ''
          }`}
          onClick={() => setActiveFilter('error')}
        >
          <span>Erros</span>
          <strong>{errorLogs}</strong>
        </button>
      </section>

      <section className="logs-screen-box">
        <div className="logs-screen-box-header">
          <div>
            <span className="logs-screen-kicker">Mensagens</span>
            <h3>Histórico em tempo real</h3>
          </div>

          <button
            type="button"
            className="logs-screen-clear-button"
            onClick={handleClearLogs}
          >
            Limpar logs
          </button>
        </div>

        <ScreenLogs
          logs={filteredLogs}
          emptyMessage="Nenhuma mensagem encontrada para este filtro."
        />
      </section>
    </div>
  )
}
