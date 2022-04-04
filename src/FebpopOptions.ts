import { ManagerOptions } from 'socket.io-client'

type ConnectOpts = Partial<ManagerOptions>

/** @internal */
export type FebpopOptions = Readonly<ConnectOpts>

/** @internal */
export type ConnectableFebpopOptions = FebpopOptions & {
  autoConnect: false
}
