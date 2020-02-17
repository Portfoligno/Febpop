
type ConnectOpts = SocketIOClient.ConnectOpts

/** @internal */
export type FebpopOptions = Readonly<ConnectOpts>

/** @internal */
export type ConnectableFebpopOptions = FebpopOptions & {
  autoConnect: false
}
