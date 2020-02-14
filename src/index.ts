import { Febpop } from 'Febpop'
import { FebpopFactory } from 'FebpopFactory'

export { Febpop } from 'Febpop'

type ConnectOpts = SocketIOClient.ConnectOpts

const febpop: FebpopFactory = (_0?: string | ConnectOpts, _1?: ConnectOpts) =>
  typeof _0 === 'string' ? new Febpop(_0, _1) : new Febpop(null, _0)

export default febpop
