import { connect as io, Socket } from 'socket.io-client'
import { CompletionHandler } from './CompletionHandler'
import { FebpopOptions } from './FebpopOptions'

const defaultOptions = {
  transports: ['websocket', 'polling']
}

/** @internal */
export interface Febpop {
  on<T>(event: string): (action: (argument: T) => void) => void

  emit<T>(event: string, timeout?: number): (argument: T, onTimeOut: () => void) => CompletionHandler
  emit<T>(event: string, timeout: null): (argument: T) => CompletionHandler
}

/** @internal */
export interface ConnectableFebpop extends Febpop {
  connect(): () => void
}


/** @internal */
export class SocketFebpop implements ConnectableFebpop {
  private readonly pendingListeners = new Array<(socket: Socket) => void>()
  private readonly emissionBuffer = new Set<() => void>()
  private readonly properties: { socket: Socket | null } = { socket: null }

  constructor(
    private readonly uri: string | null,
    private readonly options?: FebpopOptions
  ) {
    Object.freeze(options)
    Object.freeze(this)

    if (options?.autoConnect ?? true) {
      this.delegate
    }
  }

  private get delegate() {
    if (!this.properties.socket) {
      const options = !this.options ? defaultOptions : { ...defaultOptions, ...this.options }
      const socket = this.uri === null ? io(options) : io(this.uri, options)
      this.properties.socket = socket

      this.pendingListeners.forEach(f => f(socket))
      socket.on('connect', () => this.emissionBuffer.forEach(f => f()))
      socket.connect()
    }
    return this.properties.socket
  }

  connect = () => {
    const socket = this.delegate

    return () => {
      socket.disconnect()
      this.properties.socket = null
    }
  }

  on = (event: string) => (action: (argument: any) => void) => {
    if (!this.properties.socket) {
      this.pendingListeners.push(delegate => delegate.on(event, action))
    } else {
      this.delegate.on(event, action)
    }
  }

  emit = (event: string, timeout: number | null = 10000) => (argument: any, onTimeOut?: () => void) => {
    const socket = this.delegate

    const callbacks = new Array<(success: boolean) => void>(() => callbacks.length = 0)
    const callbackFunction = (success: boolean) => callbacks.slice().forEach(f => f(success))

    const emission = () => socket.emit(event, argument, () => callbackFunction(true))
    callbacks.push(() => this.emissionBuffer.delete(emission))
    this.emissionBuffer.add(emission)

    if (timeout !== null) {
      const timer = setTimeout(
        () => {
          onTimeOut!()
          callbackFunction(false)
        },
        timeout
      )

      callbacks.push(success => {
        if (success) {
          clearTimeout(timer)
        }
      })
    }
    if (socket.connected) {
      emission()
    }

    return (onComplete: (success: boolean) => void) => {
      callbacks.push(onComplete)
    }
  }
}
