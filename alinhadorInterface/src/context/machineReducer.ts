import type { MachineAction, MachineState } from '../types/machine'

/*
  Estado inicial global da máquina.

  Esse objeto representa como a aplicação começa
  antes de qualquer comunicação com o backend.
*/
export const initialMachineState: MachineState = {
  // Indica se o WebSocket com o backend está conectado
  connected: false,

  // Estado inicial do LED mostrado na interface
  led: 'Desligado',

  // Estado inicial da conexão com o Arduino
  arduino_connected: 'Desconectado',
}

/*
  Reducer principal do contexto da máquina.

  Ele recebe:
  - state: o estado atual
  - action: a ação enviada para alterar o estado

  E sempre retorna um NOVO estado.
*/
export function machineReducer(
  state: MachineState,
  action: MachineAction,
): MachineState {
  /*
    O switch verifica qual ação foi disparada
    e decide como atualizar o estado.
  */
  switch (action.type) {
    case 'SOCKET_CONNECTED':
      /*
        Quando o frontend consegue se conectar
        ao WebSocket do backend, atualizamos apenas
        o campo "connected" para true.

        O resto do estado continua igual,
        por isso usamos ...state
      */
      return {
        ...state,
        connected: true,
      }

    case 'SOCKET_DISCONNECTED':
      /*
        Quando a conexão WebSocket cai ou é encerrada,
        marcamos "connected" como false.
      */
      return {
        ...state,
        connected: false,
      }

    case 'MACHINE_UPDATED':
      /*
        Essa ação normalmente vem do backend,
        trazendo informações atualizadas da máquina.

        Aqui estamos atualizando:
        - estado do LED
        - estado de conexão do Arduino
      */
      return {
        ...state,

        /*
          Converte o valor técnico vindo do backend
          para um texto amigável na interface.

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
          Faz a mesma ideia para a conexão do Arduino.

          Regras:
          - true  => 'Conectado'
          - false => 'Desconectado'
          - qualquer outro valor => mantém o valor anterior

          Isso é útil caso o backend envie um payload parcial
          ou sem esse campo.
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
        Caso chegue uma ação desconhecida,
        o reducer não altera nada e apenas
        devolve o estado atual.
      */
      return state
  }
}