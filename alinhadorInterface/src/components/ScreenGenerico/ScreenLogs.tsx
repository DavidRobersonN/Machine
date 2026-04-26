import { useEffect, useRef } from 'react'
import './Styles.css'

type LogDirection = 'sent' | 'received'

type ScreenLogItem = {
  direction: LogDirection
  message: string
}

type ScreenLogsProps = {
  logs?: ScreenLogItem[]
  emptyMessage?: string
}

export function ScreenLogs({
  logs = [],
  emptyMessage = 'Nenhuma mensagem ainda...',
}: ScreenLogsProps) {
  /*
    Referência para a área rolável dos logs.

    Usamos essa referência para conseguir mover
    a barra de rolagem automaticamente quando
    chegar uma nova mensagem.
  */
  const logRef = useRef<HTMLDivElement | null>(null)

  /*
    Sempre que a lista de logs mudar,
    rolamos automaticamente para o final,
    mostrando a mensagem mais recente.
  */
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
              key={index}
              className={`screen-log-line ${log.direction}`}
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