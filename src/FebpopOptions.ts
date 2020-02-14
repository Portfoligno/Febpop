
type ConnectOpts = SocketIOClient.ConnectOpts

/** @internal */
export type FebpopOptions = ConnectOpts

/** @internal */
export type ConnectableFebpopOptions = ConnectOpts & {
  autoConnect: false
}
