import { isString, parse } from "./validator"

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
      @isString({ min: 6 })
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
      @isString({ max: 6 })
      long: string

      constructor(value: string) {
        this.long = value
      }
    }

    expect(() => parse(new MaxTest('short'))).not.toThrow()
    expect(() => parse(new MaxTest('123456'))).not.toThrow()
    expect(() => parse(new MaxTest('long string'))).toThrow()
  })
})
