import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react'
import type { ReactNode } from 'react'

import { useMachineSocket } from '../hooks/useMachineSocket'
import { initialMachineState, machineReducer } from './machineReducer'
import type { MachineMessage, MachineState } from '../types/machine'

type MachineContextValue = {
  state: MachineState
  sendCommand: (payload: unknown) => boolean
}

/*
  Criamos o contexto.

  Ele começa como undefined porque só existirá
  dentro do Provider.
*/
const MachineContext = createContext<MachineContextValue | undefined>(undefined)

type MachineProviderProps = {
  children: ReactNode
}

export function MachineProvider({ children }: MachineProviderProps) {
  /*
    Estado global da máquina controlado pelo reducer.
  */
  const [state, dispatch] = useReducer(machineReducer, initialMachineState)

  /*
    Quando o WebSocket conecta com sucesso,
    marcamos a aplicação como conectada
    e registramos um log visual.
  */
  const handleConnected = useCallback(() => {
    dispatch({ type: 'SOCKET_CONNECTED' })

    dispatch({
      type: 'ADD_LOG',
      payload: {
        direction: 'received',
        message: 'WebSocket conectado com sucesso',
      },
    })
  }, [])

  /*
    Quando o WebSocket desconecta,
    atualizamos o estado e registramos um log.
  */
  const handleDisconnected = useCallback(() => {
    dispatch({ type: 'SOCKET_DISCONNECTED' })

    dispatch({
      type: 'ADD_LOG',
      payload: {
        direction: 'received',
        message: 'WebSocket desconectado',
      },
    })
  }, [])

  /*
    Essa função analisa cada mensagem recebida do backend.

    Aqui centralizamos toda a interpretação
    do que chega pelo WebSocket.
  */
  const handleMachineMessage = useCallback((message: MachineMessage) => {
    /*
      1) Atualização real do estado da máquina
    */
    if (message.type === 'machine_update') {
      dispatch({
        type: 'MACHINE_UPDATED',
        payload: message.payload,
      })

      return
    }

    /*
      2) Mensagem de log enviada pelo backend
    */
    if (message.type === 'log') {
      dispatch({
        type: 'ADD_LOG',
        payload: {
          direction: message.direction,
          message: message.message,
        },
      })

      return
    }

    /*
      3) Mensagem de erro

      Aqui nós também transformamos o erro em log visual,
      para o usuário conseguir enxergar na interface.
    */
    if (message.type === 'error') {
      dispatch({
        type: 'ADD_LOG',
        payload: {
          direction: 'received',
          message: `Erro: ${message.message}`,
        },
      })

      return
    }

    /*
      4) Mensagem informativa genérica
    */
    if (message.type === 'info') {
      dispatch({
        type: 'ADD_LOG',
        payload: {
          direction: 'received',
          message: message.message,
        },
      })

      return
    }

    /*
      5) Mensagem de status de conexão enviada pelo backend

      Mesmo já tendo o estado local do socket,
      esse tipo pode ser útil para logs mais explicativos.
    */
    if (message.type === 'connection') {
      dispatch({
        type: 'ADD_LOG',
        payload: {
          direction: 'received',
          message: message.message,
        },
      })
    }
  }, [])

  /*
    Hook responsável por abrir e manter a conexão WebSocket.

    Ele recebe callbacks para avisar o Provider sobre:
    - conexão aberta
    - conexão fechada
    - mensagens recebidas
  */
  const { send } = useMachineSocket({
    onConnected: handleConnected,
    onDisconnected: handleDisconnected,
    onMachineMessage: handleMachineMessage,
  })

  /*
    Essa função encapsula o envio de comandos.

    Além de enviar para o backend, ela também registra
    no histórico de logs o que o frontend tentou mandar.
  */
  const sendCommand = useCallback(
    (payload: unknown) => {
      const success = send(payload)

      /*
        Só adicionamos o log como "sent"
        se o envio realmente aconteceu.
      */
      if (success) {
        dispatch({
          type: 'ADD_LOG',
          payload: {
            direction: 'sent',
            message: `Comando enviado: ${JSON.stringify(payload)}`,
          },
        })
      } else {
        /*
          Se não conseguiu enviar, também registramos isso,
          porque ajuda muito na depuração.
        */
        dispatch({
          type: 'ADD_LOG',
          payload: {
            direction: 'received',
            message: 'Falha ao enviar comando: WebSocket não está conectado',
          },
        })
      }

      return success
    },
    [send],
  )

  /*
    Memoizamos o valor do contexto para evitar recriações
    desnecessárias a cada renderização.
  */
  const value = useMemo(
    () => ({
      state,
      sendCommand,
    }),
    [state, sendCommand],
  )

  return (
    <MachineContext.Provider value={value}>
      {children}
    </MachineContext.Provider>
  )
}

/*
  Hook customizado para facilitar o uso do contexto.
*/
export function useMachineContext() {
  const context = useContext(MachineContext)

  /*
    Proteção:
    se alguém tentar usar o contexto fora do Provider,
    mostramos um erro claro.
  */
  if (!context) {
    throw new Error(
      'useMachineContext precisa ser usado dentro de MachineProvider',
    )
  }

  return context
}