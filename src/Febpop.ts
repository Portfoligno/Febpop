import { CompletionHandler, FebpopOptions } from 'index'
import { connect as io } from 'socket.io-client'

type Socket = SocketIOClient.Socket

const defaultOptions = {
  transports: ['websocket', 'polling']
}

/** @internal */
export interface Febpop {
  on(event: string): (action: (argument: any) => void) => void

  emit(event: string, timeout?: number): (argument: any, onTimeOut: () => void) => CompletionHandler
  emit(event: string, timeout: null): (argument: any) => CompletionHandler
}

/** @internal */
export interface ConnectableFebpop extends Febpop {
  connect(): () => void
}


/** @internal */
export class SocketFebpop implements ConnectableFebpop {
  private readonly pendingListeners = new Array<(socket: Socket) => void>()
  private readonly emissionBuffer = new Set<() => void>()
  private socket: Socket | null = null

  constructor(
    private readonly uri: string | null,
    private readonly options?: FebpopOptions
  ) {
    if (options?.autoConnect ?? true) {
      this.delegate
    }
  }

  private get delegate() {
    if (!this.socket) {
      const options = !this.options ? defaultOptions : { ...defaultOptions, ...this.options }
      const socket = this.uri === null ? io(options) : io(this.uri, options)
      this.socket = socket

      this.pendingListeners.forEach(f => f(socket))
      socket.on('connect', () => this.emissionBuffer.forEach(f => f()))
      socket.connect()
    }
    return this.socket
  }

  connect = () => {
    const socket = this.delegate

    return () => {
      socket.disconnect()
      this.socket = null
    }
  }

  on = (event: string) => (action: (argument: any) => void) => {
    if (!this.socket) {
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
