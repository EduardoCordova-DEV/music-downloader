import { io, Socket } from 'socket.io-client'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001'

// Singleton — una sola conexión reutilizada en toda la app
let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(BACKEND_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      console.log('🔌 Socket conectado:', socket?.id)
    })

    socket.on('disconnect', () => {
      console.log('🔌 Socket desconectado')
    })

    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message)
    })
  }

  return socket
}

export function getSocketId(): string | undefined {
  return getSocket().id
}
