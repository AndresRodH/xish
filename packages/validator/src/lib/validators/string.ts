import { Validator, setValidatorMetadata } from "../validator"

export interface StringValidatorOptions {
  min?: number
  max?: number
}

export class IsStringValidator implements Validator {
  #name = 'isString'

  constructor(readonly options: StringValidatorOptions = {}) { }

  get name() {
    return this.#name
  }

  validate(field: unknown) {
    if (typeof field !== 'string') {
      return { success: false as const, errors: ['is not a valid string'] }
    }

    const errors: string[] = []
    if (this.options.max && this.options.min && this.options.max < this.options.min) {
      throw new Error(`Validator configuration validation failed: max (${this.options.max}) cannot be less than min (${this.options.min})`)
    }

    if (this.options.max && field.length > this.options.max) {
      errors.push(`is longer than ${this.options.max}`)
    }
    if (this.options.min && field.length < this.options.min) {
      errors.push(`is longer than ${this.options.max}`)
    }

    return errors.length > 0 ? { success: false as const, errors } : { success: true as const }
  }
}

export function isString(options: StringValidatorOptions = {}) {
  return function <This>(
    _target: undefined,
    context: ClassFieldDecoratorContext<This>
  ) {
    setValidatorMetadata(context, new IsStringValidator(options))
  }
}

