import { useEffect, useRef } from 'react'
import './ScreenLogs.css'

type LogDirection = 'sent' | 'received'

type ScreenLogItem = {
  direction: LogDirection
  message: string
}

type ScreenLogsProps = {
  logs?: ScreenLogItem[]
  emptyMessage?: string
}

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

function isConfigLog(message: string) {
  const normalizedMessage = message.toLowerCase()

  return (
    normalizedMessage.includes('configuração') ||
    normalizedMessage.includes('configuracao') ||
    normalizedMessage.includes('config_') ||
    normalizedMessage.includes('sync_machine_config') ||
    normalizedMessage.includes('motor_roda_config_status')
  )
}

function getLogClassName(log: ScreenLogItem) {
  const classNames = ['screen-log-line', log.direction]

  if (log.message.length > 120) {
    classNames.push('long-message')
  }

  if (isConfigLog(log.message)) {
    classNames.push('config-message')
  }

  if (isErrorLog(log.message)) {
    classNames.push('error-message')
  }

  return classNames.join(' ')
}

export function ScreenLogs({
  logs = [],
  emptyMessage = 'Nenhuma mensagem ainda...',
}: ScreenLogsProps) {
  const logRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="screen-logs-wrapper">
      <div className="screen-log" ref={logRef}>
        {logs.length === 0 ? (
          <p className="screen-log-empty">{emptyMessage}</p>
        ) : (
          logs.map((log, index) => (
            <div
              key={`${log.direction}-${index}-${log.message}`}
              className={getLogClassName(log)}
            >
              <span className="log-type">
                {log.direction === 'sent' ? '→ Enviado' : '← Recebido'}
              </span>

              <span className="log-message">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}