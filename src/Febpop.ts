import { FebpopOptions } from 'index'
import { connect as io } from 'socket.io-client'

type Socket = SocketIOClient.Socket

const defaultOptions = {
  transports: ['websocket', 'polling']
}

/** @internal */
export class Febpop {
  private readonly pendingListeners = new Array<(socket: Socket) => void>()
  private readonly emissionBuffer = new Set<() => void>()
  private socket?: Socket

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

  on = (event: string) => (action: (argument: any) => void) => {
    if (!this.socket) {
      this.pendingListeners.push(delegate => delegate.on(event, action))
    } else {
      this.delegate.on(event, action)
    }
  }

  emit = (event: string) => (argument: any) => {
    const socket = this.delegate

    const emission = () => socket.emit(event, argument, () => this.emissionBuffer.delete(emission))
    this.emissionBuffer.add(emission)

    if (socket.connected) {
      emission()
    }
  }
}
