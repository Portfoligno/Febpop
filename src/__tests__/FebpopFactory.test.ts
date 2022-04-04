import febpop from 'febpop'
import { describe, it } from '@jest/globals'

describe('`febpop` factory', () => {
  it('should work without arguments', () => {
    febpop()
  })
  it('should work with explicit URI', () => {
    febpop('')
  })
  it('should work with explicit options', () => {
    febpop({})
  })
  it('should work with explicit URI and options', () => {
    febpop('', {})
  })
})
