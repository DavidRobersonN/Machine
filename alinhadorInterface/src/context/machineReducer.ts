import type { MachineAction, MachineState } from '../types/machine'

/*
  Estado inicial global da máquina.

  Esse objeto define como a aplicação começa
  antes de receber qualquer informação do backend.
*/
export const initialMachineState: MachineState = {
  // Indica se o frontend está conectado ao WebSocket
  connected: false,

  // Estado inicial do LED mostrado na interface
  led: 'Desligado',

  // Estado inicial da conexão com o Arduino
  arduino_connected: 'Desconectado',

  // Lista de mensagens enviadas e recebidas
  logs: [],
}

/*
  Reducer principal da máquina.

  Ele recebe:
  - o estado atual
  - a ação que queremos executar

  E devolve sempre um NOVO estado.
*/
export function machineReducer(
  state: MachineState,
  action: MachineAction,
): MachineState {
  /*
    O switch analisa o tipo da ação
    e decide como o estado será atualizado.
  */
  switch (action.type) {
    case 'SOCKET_CONNECTED':
      /*
        Quando o WebSocket conecta com sucesso,
        marcamos o frontend como conectado.
      */
      return {
        ...state,
        connected: true,
      }

    case 'SOCKET_DISCONNECTED':
      /*
        Quando o WebSocket desconecta,
        marcamos o frontend como desconectado.
      */
      return {
        ...state,
        connected: false,
      }

    case 'ADD_LOG':
      /*
        Adiciona um novo log ao final da lista.

        O slice(-30) mantém somente os últimos 30 logs,
        evitando crescer demais e pesar a interface.
      */
      return {
        ...state,
        logs: [...state.logs, action.payload].slice(-30),
      }

    case 'CLEAR_LOGS':
      /*
        Limpa completamente a lista de logs.
      */
      return {
        ...state,
        logs: [],
      }

    case 'MACHINE_UPDATED':
      /*
        Essa ação normalmente vem do backend,
        trazendo informações atualizadas da máquina.

        Aqui estamos atualizando:
        - o estado do LED
        - o estado da conexão com o Arduino
      */
      return {
        ...state,

        /*
          Traduz o valor técnico do backend
          para um texto mais amigável na interface.

          Regras:
          - 'ON'  => 'Ligado'
          - 'OFF' => 'Desligado'
          - qualquer outro valor => mantém o valor anterior
        */
        led:
          action.payload.led === 'ON'
            ? 'Ligado'
            : action.payload.led === 'OFF'
              ? 'Desligado'
              : state.led,

        /*
          Faz a tradução do status do Arduino.

          Regras:
          - true  => 'Conectado'
          - false => 'Desconectado'
          - qualquer outro valor => mantém o valor anterior

          Isso evita quebrar o estado caso o backend
          envie um payload incompleto.
        */
        arduino_connected:
          action.payload.arduino_connected === true
            ? 'Conectado'
            : action.payload.arduino_connected === false
              ? 'Desconectado'
              : state.arduino_connected,
      }

    default:
      /*
        Se chegar uma ação desconhecida,
        o reducer simplesmente devolve o estado atual.
      */
      return state
  }
}