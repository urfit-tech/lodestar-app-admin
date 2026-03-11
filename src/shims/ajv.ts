type PrimitiveSchema = {
  type: 'string' | 'boolean' | 'number' | 'integer'
  nullable?: boolean
}

type ArraySchema = {
  type: 'array'
  items: Schema
  nullable?: boolean
}

type ObjectSchema = {
  type: 'object'
  properties?: Record<string, Schema>
  required?: string[]
  nullable?: boolean
}

type Schema = PrimitiveSchema | ArraySchema | ObjectSchema

export type JSONSchemaType<T> = ObjectSchema & { __type?: T }

type ValidateFunction<T> = ((value: unknown) => value is T) & {
  errors: string[] | null
}

const validateSchema = (value: unknown, schema: Schema, path: string, errors: string[]) => {
  if (value == null) {
    if (schema.nullable) {
      return true
    }

    errors.push(`${path} should not be null`)
    return false
  }

  switch (schema.type) {
    case 'string':
      if (typeof value !== 'string') {
        errors.push(`${path} should be string`)
        return false
      }
      return true

    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push(`${path} should be boolean`)
        return false
      }
      return true

    case 'number':
      if (typeof value !== 'number') {
        errors.push(`${path} should be number`)
        return false
      }
      return true

    case 'integer':
      if (!Number.isInteger(value)) {
        errors.push(`${path} should be integer`)
        return false
      }
      return true

    case 'array':
      if (!Array.isArray(value)) {
        errors.push(`${path} should be array`)
        return false
      }
      return value.every((item, index) => validateSchema(item, schema.items, `${path}[${index}]`, errors))

    case 'object':
      if (typeof value !== 'object' || Array.isArray(value)) {
        errors.push(`${path} should be object`)
        return false
      }

      const objectValue = value as Record<string, unknown>
      const requiredFields = schema.required || []
      const properties = schema.properties || {}

      for (const field of requiredFields) {
        if (!(field in objectValue)) {
          errors.push(`${path}.${field} is required`)
        }
      }

      for (const [field, propertySchema] of Object.entries(properties)) {
        if (!(field in objectValue)) {
          continue
        }

        validateSchema(objectValue[field], propertySchema, `${path}.${field}`, errors)
      }

      return errors.length === 0
  }
}

export default class Ajv {
  compile<T>(schema: JSONSchemaType<T>): ValidateFunction<T> {
    const validate = ((value: unknown): value is T => {
      const errors: string[] = []
      const valid = validateSchema(value, schema, '$', errors)
      validate.errors = valid ? null : errors
      return valid
    }) as ValidateFunction<T>

    validate.errors = null
    return validate
  }
}
