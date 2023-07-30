// @ts-expect-error polyfill
Symbol.metadata ??= Symbol("Symbol.metadata");

// ------------------------- helpers -----------------------------
type Maybe<Type> = Type | undefined | null


// ------------------------- metadata -----------------------------
interface Validator {
  name: string
  validate: (field: unknown) => { success: true, errors?: never } | { success: false, errors: string[] }
}

interface Schema {
  [property: string]: Validator[] | undefined
}

const storage = new WeakMap<object, Schema>

/**
  * Initializes a schema or appends validation metadata to the existing one
  */
function setValidatorMetadata(context: ClassFieldDecoratorContext, validator: Validator) {
  if (typeof context.name !== "string") {
    throw new Error("Can only validate string properties.");
  }

  let schema = storage.get(context.metadata)

  if (schema === undefined) {
    schema = {}
    storage.set(context.metadata, schema)
  }

  const validators = schema[context.name] ??= []
  validators.push(validator)
}

// ---------------------------- validation -----------------------
export function parse<Data extends object>(obj: Data): Data {
  // @ts-expect-error this should be valid
  const schema = storage.get(obj.constructor[Symbol.metadata])

  if (!schema) throw new Error('object does not have a Schema associated with it')

  // all validation errors keyed by property
  const errors: Record<string, string[]> = {}

  // loop through the object entries to get their schema by property key
  for (const [property, value] of Object.entries(obj)) {
    const validators = schema[property]

    // call `.validate` on all validators and collect errors
    if (validators && validators.length > 0) {
      for (const validator of validators) {
        const result = validator.validate(value)
        if (!result.success) errors[property] = result.errors
      }
    }
  }

  // throw the field errors
  if (Object.keys(errors).length > 0) throw errors

  return obj
}

// ----------------------------- @isString -----------------------
interface StringValidatorOptions {
  min?: number
  max?: number
}

class IsStringValidator implements Validator {
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
    context: ClassFieldDecoratorContext<This, Maybe<string>>
  ) {
    setValidatorMetadata(context, new IsStringValidator(options))
  }
}

