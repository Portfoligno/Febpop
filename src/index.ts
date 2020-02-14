import { ConnectableFebpop, Febpop, SocketFebpop } from 'Febpop'
import { FebpopFactory } from 'FebpopFactory'
import { ConnectableFebpopOptions, FebpopOptions } from 'FebpopOptions'

export { ConnectableFebpop, Febpop } from 'Febpop'
export { ConnectableFebpopOptions, FebpopOptions } from 'FebpopOptions'

const febpop: FebpopFactory = (_0?: string | FebpopOptions, _1?: FebpopOptions) =>
  typeof _0 === 'string' ? new SocketFebpop(_0, _1) : new SocketFebpop(null, _0)

export default febpop
