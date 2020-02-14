import { Febpop, FebpopOptions } from 'index'

/** @internal */
export interface FebpopFactory {
  (uri: string, options?: FebpopOptions): Febpop

  (options?: FebpopOptions): Febpop
}
