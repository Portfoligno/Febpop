import febpop from 'febpop'

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
