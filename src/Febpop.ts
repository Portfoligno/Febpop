import { connect as io } from 'socket.io-client'

type ConnectOpts = SocketIOClient.ConnectOpts
type Socket = SocketIOClient.Socket

const defaultOptions = {
  transports: ['websocket', 'polling']
}

/** @internal */
export class Febpop {
  private socket?: Socket

  constructor(
    private readonly uri: string | null,
    private readonly options?: ConnectOpts
  ) {
  }

  private get delegate() {
    if (!this.socket) {
      const options = !this.options ? defaultOptions : { ...defaultOptions, ...this.options }
      this.socket = this.uri === null ? io(options) : io(this.uri, options)
    }
    return this.socket
  }
}
