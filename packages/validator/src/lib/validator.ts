// @ts-expect-error polyfill for Symbol.metadata
Symbol.metadata ??= Symbol("Symbol.metadata");

export interface Validator {
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
export function setValidatorMetadata(context: ClassFieldDecoratorContext, validator: Validator) {
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

