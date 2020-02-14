import { Febpop } from 'Febpop'
import { FebpopFactory } from 'FebpopFactory'
import { FebpopOptions } from 'FebpopOptions'

export { Febpop } from 'Febpop'
export { FebpopOptions } from 'FebpopOptions'

const febpop: FebpopFactory = (_0?: string | FebpopOptions, _1?: FebpopOptions) =>
  typeof _0 === 'string' ? new Febpop(_0, _1) : new Febpop(null, _0)

export default febpop
