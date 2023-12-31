import { isString } from './string'
import { parse } from '../validator'

describe('isString', () => {
  test('passes if string', () => {
    class Testing {
      @isString()
      hey?: string

      constructor(value?: string) {
        this.hey = value
      }
    }

    expect(() => parse(new Testing())).toThrow()
    expect(() => parse(new Testing('yo!'))).not.toThrow()
  })

  test('should check for min length', () => {
    class MinTest {
      @isString({ minLength: 6 })
      short: string

      constructor(value: string) {
        this.short = value
      }
    }

    expect(() => parse(new MinTest('short'))).toThrow()
    expect(() => parse(new MinTest('123456'))).not.toThrow()
    expect(() => parse(new MinTest('long string'))).not.toThrow()
  })

  test('should check for max length', () => {
    class MaxTest {
      @isString({ maxLength: 6 })
      long: string

      constructor(value: string) {
        this.long = value
      }
    }

    expect(() => parse(new MaxTest('short'))).not.toThrow()
    expect(() => parse(new MaxTest('123456'))).not.toThrow()
    expect(() => parse(new MaxTest('long string'))).toThrow()
  })

  test('min/max rules can be combined', () => {
    class MinMaxTest {
      @isString({ minLength: 3, maxLength: 6 })
      field: string

      constructor(value: string) {
        this.field = value
      }
    }

    expect(() => parse(new MinMaxTest('passes'))).not.toThrow()
    expect(() => parse(new MinMaxTest('ah'))).toThrow()
    expect(() => parse(new MinMaxTest('too long'))).toThrow()
  })

  test('max cannot be less than min', () => {
    class MinMaxValidationTest {
      @isString({ minLength: 6, maxLength: 3 })
      thisFails = ''
    }

    expect(() => parse(new MinMaxValidationTest())).toThrow('Validator configuration validation failed: max length (3) cannot be less than min length (6)')
  })
})
