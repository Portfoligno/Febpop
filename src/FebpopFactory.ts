import { ConnectableFebpop, Febpop } from './Febpop'
import { ConnectableFebpopOptions, FebpopOptions } from './FebpopOptions'

/** @internal */
export interface FebpopFactory {
  (uri: string, options: ConnectableFebpopOptions): ConnectableFebpop
  (uri: string, options?: FebpopOptions): Febpop

  (options: ConnectableFebpopOptions): ConnectableFebpop
  (options?: FebpopOptions): Febpop
}
