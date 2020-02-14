import { Febpop } from 'index'

type ConnectOpts = SocketIOClient.ConnectOpts

/** @internal */
export interface FebpopFactory {
  (uri: string, options?: ConnectOpts): Febpop

  (options?: ConnectOpts): Febpop
}
