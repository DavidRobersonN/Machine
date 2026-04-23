import { useEffect, useRef } from 'react'
import { useMachineContext } from '../../../../context/MachineContext'
import './Styles.css'

export function ScreenLogs() {
  /*
    Pega o state global da máquina pelo contexto.
    É daqui que vem a lista de logs.
  */
  const { state } = useMachineContext()

  /*
    Cria uma referência para a div que contém os logs.

    Com essa referência, conseguimos acessar o elemento HTML
    diretamente para controlar a rolagem.
  */
  const logRef = useRef<HTMLDivElement | null>(null)

  /*
    Sempre que a lista de logs mudar, este efeito será executado.

    A ideia aqui é:
    - quando chegar um log novo
    - a barra de rolagem desce automaticamente
    - assim o usuário sempre vê os logs mais recentes
  */
  useEffect(() => {
    if (logRef.current) {
      /*
        scrollTop:
        representa a posição atual da rolagem vertical.

        scrollHeight:
        representa toda a altura do conteúdo interno.

        Ao colocar scrollTop = scrollHeight,
        fazemos a área rolar até o final.
      */
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [state.logs])

  return (
    /*
      Wrapper externo da área de logs.

      Ele ocupa todo o espaço disponível da tela principal
      e serve para controlar padding e limite da área.
    */
    <div className="screen-logs-wrapper">
      {/*
        Área interna realmente rolável.

        O ref={logRef} conecta esta div ao useRef,
        permitindo controlar a rolagem pelo useEffect.
      */}
      <div className="screen-log" ref={logRef}>
        {/*
          Se não existir nenhum log ainda,
          mostramos uma mensagem padrão.
        */}
        {state.logs.length === 0 ? (
          <p className="screen-log-empty">Nenhuma mensagem ainda...</p>
        ) : (
          /*
            Se existir log, percorremos o array state.logs
            e renderizamos cada item na tela.
          */
          state.logs.map((log, index) => (
            /*
              Cada linha recebe uma classe dinâmica:
              - sent
              - received

              Isso permite mudar o estilo visual de cada tipo de log.
            */
            <div key={index} className={`screen-log-line ${log.direction}`}>
              <span className="log-type">
                {/*
                  Mostra um texto diferente conforme a direção do log.
                */}
                {log.direction === 'sent' ? '→ Enviado' : '← Recebido'}
              </span>

              <span className="log-message">
                {/*
                  Exibe o conteúdo textual do log.
                */}
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}