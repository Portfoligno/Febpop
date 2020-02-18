[![Build Status](https://circleci.com/gh/justincase-jp/Febpop/tree/master.svg?style=shield)](
  https://circleci.com/gh/justincase-jp/Febpop
)
[![npm version](https://badge.fury.io/js/febpop.svg)](
  https://badge.fury.io/js/febpop
)

Febpop
===
Febpop is an opinionated wrapper to enforce consistent data transmission within Socket.IO.

The reliability of packet transmission in Socket.IO is guaranteed by the underlying TCP protocol.
Combining with its built-in acknowledgement mechanism, it would seem at first, transactional message deliveries can be
implemented by simplify waiting for acknowledgement responses from the server.

However, in the real world, clients may have poor networks and servers need restarts from time to time.
A client could get stuck in waiting for acknowledgement responses that will never happen.


This library is created to address such a problem by enforcing at-least-once delivery semantics:

* Each emission of messages in this library is preconfigured with a timeout (default: 10 seconds).
* Within the configured timeout, a re-emission will be attempted every time a reconnection takes place, until it is
confirmed as acknowledged from the server.


## Installation

```sh
npm install febpop
```


## Usage
While Socket.IO is a rich library that provides quite an amount of features, this library focuses on an essential
subset. The core interface is simplified as:

```ts
export interface Febpop {
  on<T>(event: string): (action: (argument: T) => void) => void

  emit<T>(event: string, timeout?: number): (argument: T, onTimeOut: () => void) => CompletionHandler
  emit<T>(event: string, timeout: null): (argument: T) => CompletionHandler
}
```

Functions are curried in advance for the ease to define message types. For example:

```ts
import febpop, { Febpop } from 'febpop'

class ApiService {
  constructor(private readonly febpop: Febpop = febpop('http://example.com/')) {
  }

  onConnect = this.febpop.on<unknown>('connect')
  onToggle = this.febpop.on<'on' | 'off'>('toggle')

  emitChat = this.febpop.emit<{ requestKey: number, text: string }>('chat')
  emitCount = this.febpop.emit<number>('count')
}
```

_Important: You may want to ensure callbacks at the server-side, as such:_

```ts
import { listen } from 'socket.io'

cosnt server = listen(80)

server.on(
  'connect',
  socket => {
    socket.on('event1', (event1, callback) => {
      // Perform server-side logics on `event1`
      // ...
      callback()
    })
  }
)

// Or even more carefully
server.on(
  'connect',
  socket => {
    socket.on('event2', (event2, callback) => {
      try {
        // Perform server-side logics on `event2`
        // ...
      } finally {
        callback()
      }
    })
    socket.on('event3', (event3, callback) => {
      const promise = new Promise(resolve => {
        // Perform server-side logics on `event3`
        // ...
        resolve()
      })
      promise.finally(callback)
    }
  }
)
```
