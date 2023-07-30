import { Validator, setValidatorMetadata } from "../validator"

export interface StringValidatorOptions {
  /**
  * Maximum length of the string
  */
  minLength?: number
  /**
  * Minimum length of the string
  */
  maxLength?: number
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
    if (this.options.maxLength && this.options.minLength && this.options.maxLength < this.options.minLength) {
      throw new Error(`Validator configuration validation failed: max length (${this.options.maxLength}) cannot be less than min lenght (${this.options.minLength})`)
    }

    if (this.options.maxLength && field.length > this.options.maxLength) {
      errors.push(`is longer than ${this.options.maxLength}`)
    }
    if (this.options.minLength && field.length < this.options.minLength) {
      errors.push(`is longer than ${this.options.maxLength}`)
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

