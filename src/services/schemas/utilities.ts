import { greaterThan, greaterThanOrEqual, isEmail, isRequired, isValidJsonString, lessThan, lessThanOrEqual, ValidationRule, withMessage } from '../validate'
import { schemaPropertyServiceFactory } from './properties'
import { SchemaProperty, SchemaPropertyInputAttrs, Schema, SchemaValues, SchemaValue } from '@/types/schemas'
import { withPropsWithoutExcludedFactory } from '@/utilities/components'

export type SchemaPropertyComponentWithProps = ReturnType<typeof schemaPropertyComponentWithProps> | null

/*
 * Used for creating SchemaProperty meta. Defines the component and props necessary for rendering a SchemaProperty.
 */
export const schemaPropertyComponentWithProps = withPropsWithoutExcludedFactory('modelValue')

/*
 * Gets a UI friendly version of an empty value for a specific schema. Used for create forms that have no existing value.
 */
export function getSchemaDefaultValues(schema: Schema): SchemaValues {
  return getSchemaPropertyRequestValue(schema, {}) as SchemaValues
}

/*
 * Gets a ui friendly version a schema's api friendly values. Used for mapping.
 */
export function getSchemaResponseValue(schema: Schema, values: SchemaValues): SchemaValues {
  return getSchemaPropertyResponseValue(schema, values) as SchemaValues
}

/*
 * Gets a api friendly version a schema's ui friendly values. Used for mapping.
 */
export function getSchemaRequestValue(schema: Schema, values: SchemaValues): SchemaValues {
  return getSchemaPropertyRequestValue(schema, values) as SchemaValues
}

/*
 * Gets a UI friendly version of a property's api friendly value. Used for mapping.
 */
export function getSchemaPropertyResponseValue(property: SchemaProperty, value: SchemaValue): SchemaValue {
  const service = schemaPropertyServiceFactory(property, 0)

  return service.mapResponseValue(value)
}

/*
 * Gets a api friendly version of a property's UI friendly value. Used for mapping.
 */
export function getSchemaPropertyRequestValue(property: SchemaProperty, value: SchemaValue): SchemaValue {
  const service = schemaPropertyServiceFactory(property, 0)

  return service.mapRequestValue(value)
}

/*
 * Gets any attributes for a property that should be bound to the component used to edit a property.
 * Attrs are added to the property's meta in the meta resolver.
 */
export function getSchemaPropertyAttrs(property: SchemaProperty): SchemaPropertyInputAttrs {
  const attrs: SchemaPropertyInputAttrs = {}

  const placeholder = property.default ?? property.example

  if (placeholder) {
    attrs.placeholder = placeholder
  }

  if (property.minLength !== undefined || property.minimum !== undefined) {
    attrs.min = property.minLength ?? property.minimum
  }

  if (property.maxLength !== undefined || property.maximum !== undefined) {
    attrs.max = property.maxLength ?? property.maximum
  }

  if (property.multipleOf) {
    attrs.step = property.multipleOf
  }

  // todo: confirm we should do this. this might break secrets
  if (property.format === 'password') {
    attrs.type = 'password'
  }

  return attrs
}

/*
 * Gets any validation rules necessary for creating/updating a property in the ui.
 * Validators are added to the property's meta in the meta resolver.
 */
export function getSchemaPropertyValidators(property: SchemaProperty, required: boolean): ValidationRule[] {
  const { title = 'Property', type } = property
  const validators: ValidationRule[] = []

  if (type === undefined) {
    validators.push(withMessage(isValidJsonString, `${title} must be JSON`))
  }

  if (property.type === 'string') {
    if (property.format === 'email') {
      validators.push(withMessage(isEmail, `${title} must be a valid email address`))
    }

    if (property.format === 'json-string') {
      validators.push(withMessage(isValidJsonString, `${title} must be JSON`))
    }
  }

  const greaterThanOrEqualValue = property.minLength ?? property.minimum ?? property.minItems

  if (greaterThanOrEqualValue !== undefined) {
    validators.push(withMessage(greaterThanOrEqual(greaterThanOrEqualValue), `${title} must be greater than or equal to ${greaterThanOrEqualValue}`))
  }

  const lessThanOrEqualValue = property.maxLength ?? property.maximum ?? property.maxItems

  if (lessThanOrEqualValue !== undefined) {
    validators.push(withMessage(lessThanOrEqual(lessThanOrEqualValue), `${title} must be less than or equal to ${lessThanOrEqualValue}`))
  }

  if (property.exclusiveMinimum !== undefined) {
    validators.push(withMessage(greaterThan(property.exclusiveMinimum), `${title} must be greater than ${property.exclusiveMinimum}`))
  }

  if (property.exclusiveMaximum !== undefined) {
    validators.push(withMessage(lessThan(property.exclusiveMaximum), `${title} must be less than ${property.exclusiveMaximum}`))
  }

  if (required) {
    validators.push(withMessage(isRequired, `${title} is required`))
  }

  return validators
}