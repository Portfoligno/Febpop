import febpop from 'febpop'
import { createServer } from 'http'
import { describe, expect, it } from '@jest/globals'
import { AddressInfo } from 'net'
import { Server } from 'socket.io'

// Test helpers
const event = 'test-event'
const timeOutSignal = {}
const remoteCompletionSignal = {}

const delay = (ms: number) => new Promise(
  resolve => setTimeout(() => resolve(timeOutSignal), ms)
)

const receiveOnly = (server: Server, event: string) => new Promise(
  resolve => server.on(
    'connect',
    socket => socket.on(event, () => resolve(remoteCompletionSignal))
  )
)

const acknowledge = (server: Server, event: string) => server.on(
  'connect',
  socket => socket.on(event, (_, callback) => callback())
)

const setUpServer: (port?: number) => [Server, string, number] = (port = 0) => {
  const httpServer = createServer()
  const server = new Server().listen(httpServer)
  const actualPort = (httpServer.listen(port).address() as AddressInfo).port

  return [server, `http://localhost:${actualPort}`, actualPort]
}


// Test cases
describe('`emit` calls', () => {
  it('should work with acknowledgement', () => {
    const [server, uri] = setUpServer()
    acknowledge(server, event)

    const result = new Promise(
      febpop(uri).emit(event, null)(null)
    )
    return result
      .then(acknowledged => expect(acknowledged).toBe(true))
      .finally(() => server.close())
  })

  it('should not retry if it is already been acknowledged', () => {
    const [server, uri, port] = setUpServer()
    acknowledge(server, event)

    const result = new Promise(
      febpop(uri).emit(event, null)(null)
    )
    return result
      .then(acknowledged => expect(acknowledged).toBe(true))
      .finally(() => server.close())
      .then(() => {
        const [restartedServer] = setUpServer(port)

        return Promise
          .race([
            receiveOnly(restartedServer, event),
            delay(100)
          ])
          .finally(() => restartedServer.close())
      })
      .then(signal => expect(signal).toBe(timeOutSignal))
  })


  it('should time out if it is not being acknowledged', () => {
    const [server, uri] = setUpServer()
    const remoteResult = receiveOnly(server, event)

    const result = new Promise(
      febpop(uri).emit(event, 100)(null, () => { })
    )
    return result
      .then(acknowledged => expect(acknowledged).toBe(false))
      .then(() => remoteResult)
      .finally(() => server.close())
  })

  it('should retry if it is not being acknowledged', () => {
    const [server, uri, port] = setUpServer()
    const remoteResult = receiveOnly(server, event)

    const result = new Promise(
      febpop(uri).emit(event, null)(null)
    )
    return Promise
      .race([remoteResult, result])
      .then(signal => expect(signal).toBe(remoteCompletionSignal))
      .finally(() => server.close())
      .then(() => {
        const [restartedServer] = setUpServer(port)
        acknowledge(restartedServer, event)

        return result.finally(() => restartedServer.close())
      })
  })
})
