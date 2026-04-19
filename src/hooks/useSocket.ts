import { useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = (import.meta as any).env?.VITE_SOCKET_URL || window.location.origin

let socket: Socket | null = null

export function useSocket() {
  useEffect(() => {
    if (!socket) {
      socket = io(SOCKET_URL, {
        path: '/socket.io/',
        autoConnect: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })

      socket.on('connect', () => {
        console.log('Socket connected:', socket?.id)
        socket?.emit('join', 'sofia-guide')
      })

      socket.on('disconnect', () => {
        console.log('Socket disconnected')
      })

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
      })

      socket.on('error', (error) => {
        console.error('Socket error:', error)
      })
    }

    return () => {
    }
  }, [])

  return socket
}

export function getSocket() {
  return socket
}
