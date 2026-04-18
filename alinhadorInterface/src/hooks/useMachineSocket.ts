import { useEffect, useRef } from 'react'
import { createMachineSocket, sendSocketMessage } from '../services/machineSocket'
import type { MachineMessage } from '../types/machine'

type UseMachineSocketParams = {
  onConnected: () => void
  onDisconnected: () => void
  onMachineMessage: (message: MachineMessage) => void
}

export function useMachineSocket({
  onConnected,
  onDisconnected,
  onMachineMessage,
}: UseMachineSocketParams) {
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const socket = createMachineSocket(
      onConnected,
      onDisconnected,
      onMachineMessage,
    )

    socketRef.current = socket

    return () => {
      socket.close()
      socketRef.current = null
    }
  }, [onConnected, onDisconnected, onMachineMessage])

  function send(payload: unknown): boolean {
    if (!socketRef.current) {
      console.error('Socket ainda não foi criado')
      return false
    }

    return sendSocketMessage(socketRef.current, payload)
  }

  return {
    send,
  }
}