export type LedBackendState = 'ON' | 'OFF'
export type LedUiState = 'Ligado' | 'Desligado'
export type ArduinoConnectionState = 'Conectado' | 'Desconectado'

export type MotorDirection = 'tighten' | 'loosen'

/*
  Representa um item do histórico de logs da aplicação.

  direction:
  - 'sent'     -> algo enviado pelo frontend ou backend
  - 'received' -> algo recebido pelo frontend ou backend

  message:
  - texto que será exibido na interface
*/
export type MachineLog = {
  direction: 'sent' | 'received'
  message: string
}

/*
  Estado global da máquina usado no React.
*/
export interface MachineState {
  connected: boolean
  led: LedUiState
  arduino_connected: ArduinoConnectionState
  logs: MachineLog[]
}

/*
  Payload enviado pelo backend quando houver atualização
  do estado da máquina.
*/
export interface MachineUpdatePayload {
  led?: LedBackendState
  arduino_connected?: boolean
}

/*
  Mensagem principal de atualização da máquina.
*/
export interface MachineUpdateMessage {
  type: 'machine_update'
  payload: MachineUpdatePayload
}

/*
  Mensagem opcional para informar status de conexão.
*/
export interface ConnectionMessage {
  type: 'connection'
  status: 'connected' | 'disconnected'
  message: string
}

/*
  Mensagem de erro enviada pelo backend.
*/
export interface ErrorMessage {
  type: 'error'
  message: string
}

/*
  Mensagem informativa genérica.
*/
export interface InfoMessage {
  type: 'info'
  message: string
  received?: unknown
}

/*
  Mensagem específica de log enviada pelo backend.

  Exemplo:
  {
    type: 'log',
    direction: 'received',
    message: 'Mensagem recebida do frontend: ...'
  }
*/
export interface LogMessage {
  type: 'log'
  direction: 'sent' | 'received'
  message: string
}

/*
  União de todas as mensagens que podem chegar
  do backend pelo WebSocket.
*/
export type MachineMessage =
  | MachineUpdateMessage
  | ConnectionMessage
  | ErrorMessage
  | InfoMessage
  | LogMessage

/*
  Ações que o reducer entende.
*/
export type MachineAction =
  | { type: 'SOCKET_CONNECTED' }
  | { type: 'SOCKET_DISCONNECTED' }
  | { type: 'MACHINE_UPDATED'; payload: MachineUpdatePayload }
  | { type: 'ADD_LOG'; payload: MachineLog }
  | { type: 'CLEAR_LOGS' }