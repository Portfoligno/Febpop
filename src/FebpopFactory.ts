import { ConnectableFebpop, ConnectableFebpopOptions, Febpop, FebpopOptions } from 'index'

/** @internal */
export interface FebpopFactory {
  (uri: string, options: ConnectableFebpopOptions): ConnectableFebpop
  (uri: string, options?: FebpopOptions): Febpop

  (options: ConnectableFebpopOptions): ConnectableFebpop
  (options?: FebpopOptions): Febpop
}
