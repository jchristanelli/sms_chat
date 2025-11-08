import { io, type Socket } from 'socket.io-client'

type SocketEventHandler = (...args: any[]) => void

class SocketService {
  private socket: Socket | null = null

  get id () {
    return this.socket?.id
  }

  get connected () {
    return this.socket?.connected ?? false
  }

  connect (url?: string, options: Partial<Parameters<typeof io>[1]> = {}) {
    if (this.socket) {
      return this.socket
    }

    this.socket = io(url || window.location.origin, {
      autoConnect: true,
      reconnection: true,
      transports: ['websocket', 'polling'],
      ...options,
    })

    this.socket.on('connect', () => {
      console.log('[Socket.IO] Connected', this.socket?.id)
    })

    this.socket.on('welcome', () => console.log('[Socket.IO] Welcome received'))
    this.socket.on('disconnect', reason => console.log('[Socket.IO] Disconnected:', reason))
    this.socket.on('connect_error', err => console.error('[Socket.IO] Connect error:', err))

    if (import.meta.env.DEV) {
      this.socket.onAny((event, ...args) => {
        console.debug(`[Socket.IO] Event: ${event}`, args)
      })
    }

    return this.socket
  }

  disconnect () {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  on (event: string, handler: SocketEventHandler) {
    this.socket?.on(event, handler)
  }

  off (event: string, handler?: SocketEventHandler) {
    this.socket?.off(event, handler)
  }

  emit (event: string, ...args: any[]) {
    this.socket?.emit(event, ...args)
  }
}

export const socketService = new SocketService()
