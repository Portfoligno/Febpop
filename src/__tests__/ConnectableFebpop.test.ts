import febpop, { Febpop } from 'febpop'
import { createServer } from 'http'
import { AddressInfo } from 'net'
import { Server } from 'socket.io'
import { connect } from 'socket.io-client'

const isConnected: (febpop: Febpop) => boolean =
    febpop => (febpop as any).properties.socket?.connected ?? false // Peek at internal properties


describe('`autoConnect` option', () => {
  // Set up a shared server instance
  const httpServer = createServer()
  const server = new Server().listen(httpServer)
  const uri = `http://localhost:${(httpServer.listen(0).address() as AddressInfo).port}`
  afterAll(() => server.close())

  // Checker promise function
  const checker = () => new Promise(
    resolve => connect(uri).once(
      'connect',
      () => setTimeout(resolve, 10) // We need some delay
    )
  )


  // Verification of connection states
  it('should connect with default value', () => {
    const client = febpop(uri)

    return checker().then(() => expect(isConnected(client)).toBe(true))
  })

  it('should connect with explicit `true` value', () => {
    const client = febpop(uri, { autoConnect: true })

    return checker().then(() => expect(isConnected(client)).toBe(true))
  })

  it('should not connect with explicit `false` value', () => {
    const client = febpop(uri, { autoConnect: false })

    return checker().then(() => expect(isConnected(client)).toBe(false))
  })


  it('should connect upon `emit` call', () => {
    const client = febpop(uri, { autoConnect: false })
    client.emit('', null)(null)

    return checker().then(() => expect(isConnected(client)).toBe(true))
  })

  it('should connect upon explicit `connect` call', () => {
    const client = febpop(uri, { autoConnect: false })
    client.connect()

    return checker().then(() => expect(isConnected(client)).toBe(true))
  })

  it('should disconnect upon call on a valid connection handle', () => {
    const client = febpop(uri, { autoConnect: false })
    const handle = client.connect()

    return checker()
      .then(() => expect(isConnected(client)).toBe(true))
      .then(handle)
      .then(checker)
      .then(() => expect(isConnected(client)).toBe(false))
  })
})
