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

  // Lista de portas seriais disponíveis (inicialmente vazia)
  available_ports: [],

  selected_port: null,
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
        case 'SET_SELECTED_PORT':
      /*
        Essa action é disparada pelo frontend
        quando o usuário escolhe uma porta na interface.
      */
      return {
        ...state,
        selected_port: action.payload,
      }

    case 'SOCKET_CONNECTED':
      /*
        Quando o WebSocket conecta com sucesso,
        marcamos o frontend como conectado.
      */
      return {
        ...state,
        connected: true,
      }
      
    case 'SET_AVAILABLE_PORTS':
      return {
        ...state,
        available_ports: action.payload,
      }

    case 'SOCKET_DISCONNECTED':
      /*
        Quando o WebSocket desconecta,
        marcamos o frontend como desconectado.

        Também faz sentido considerar o Arduino
        como desconectado na interface,
        já que perdemos o canal principal de comunicação.
      */
      return {
        ...state,
        connected: false,
        arduino_connected: 'Desconectado',
      }

    case 'ADD_LOG':
      /*
        Adiciona um novo log ao final da lista.

        O slice(-3) mantém somente os últimos 3 logs,
        evitando crescer demais e pesar a interface.
      */
      return {
        ...state,
        logs: [...state.logs, action.payload].slice(-3),
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

              
                /*
          Atualiza a porta selecionada se o backend enviar.
          Caso não envie, mantém a atual.
        */
        selected_port:
          action.payload.selected_port !== undefined
            ? action.payload.selected_port
            : state.selected_port,
      }

    default:
      /*
        Se chegar uma ação desconhecida,
        o reducer simplesmente devolve o estado atual.
      */
      return state
  }
}