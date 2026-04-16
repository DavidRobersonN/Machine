import type { MachineMessage } from '../types/machine'

export function createMachineSocket(
  onOpen: () => void,
  onClose: () => void,
  onMessage: (message: MachineMessage) => void,
) {
  const socket = new WebSocket('ws://127.0.0.1:8000/ws/machine/')

  socket.onopen = () => {
    onOpen()
  }

  socket.onclose = () => {
    onClose()
  }

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as MachineMessage
      console.log('Mensagem recebida do WebSocket:', data)
      onMessage(data)
    } catch (error) {
      console.error('Erro ao ler mensagem do WebSocket:', error)
    }
  }

  return socket
}

export function sendSocketMessage(socket: WebSocket, payload: unknown): boolean {
  if (socket.readyState !== WebSocket.OPEN) {
    console.error('WebSocket não está conectado')
    return false
  }

  socket.send(JSON.stringify(payload))
  return true
}