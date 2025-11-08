import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

export function connectSocket (url?: string, options = {}) {
  if (socket) {
    return socket
  }

  socket = io(url || window.location.origin, {
    autoConnect: true,
    reconnection: true,
    transports: ['websocket', 'polling'],
    ...options,
  })

  socket.on('connect', () => {
    console.log('[Socket.IO] Connected', socket?.id)
  })
  socket.on('welcome', () => console.log('[Socket.IO] Welcome received'))
  socket.on('disconnect', reason => console.log('[Socket.IO] Disconnected:', reason))
  socket.on('connect_error', err => console.error('[Socket.IO] Connect error:', err))

  if (import.meta.env.DEV) {
    socket.onAny((event, ...args) => {
      console.debug(`[Socket.IO] Event: ${event}`, args)
    })
  }

  return socket
}

export function disconnectSocket () {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
