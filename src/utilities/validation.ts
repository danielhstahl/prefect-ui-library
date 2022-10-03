import { formatDate, formatDateTimeNumeric, isDateAfter, isDateAfterOrEqual, isDateBefore, isDateBeforeOrEqual } from '@prefecthq/prefect-design'
import { isEmptyArray } from './arrays'
import { isDate, isInvalidDate } from './dates'
import { isEmptyString } from './strings'
import { isNullish } from './variables'

export type ValidationMethod = (value: unknown) => true | string | Promise<true | string>
export type ValidationMethodFactory = (property: string) => ValidationMethod
export type WithMessageArgs = [validationFactory: ValidationMethodFactory, message: string]

export function isWithMessageArgs(value: ValidationMethodFactory | WithMessageArgs): value is WithMessageArgs {
  return Array.isArray(value)
}

export function withMessage(validationFactory: ValidationMethodFactory, message: string): ValidationMethod {
  const validationMethod = validationFactory('property')

  return async (value: unknown) => {
    const passesValidation = await validationMethod(value) === true

    return passesValidation ? true : message
  }
}

export function fieldRules(property: string, ...rules: (ValidationMethodFactory | WithMessageArgs)[]): ValidationMethod[] {
  return rules.map(rule => {
    if (isWithMessageArgs(rule)) {
      const [method, message] = rule

      return withMessage(method, message)
    }

    return rule(property)
  })
}

export const isRequired: ValidationMethodFactory = (property: string) => (value: unknown) => {
  if (isNullish(value) || isEmptyArray(value) || isEmptyString(value) || isInvalidDate(value)) {
    return `${property} is required`
  }

  return true
}

export const isRequiredIf = (condition: () => boolean): ValidationMethodFactory => property => value => {
  const required = condition()

  if (!required) {
    return true
  }

  return isRequired(property)(value)
}

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const isEmail: ValidationMethodFactory = (property: string) => (value: unknown) => {
  if (isNullish(value) || isEmptyString(value)) {
    return true
  }

  if (typeof value === 'string' && EMAIL_REGEX.test(value)) {
    return true
  }

  return `${property} is not a valid email address`
}

export const isLessThan = (max: number): ValidationMethodFactory => (property: string) => (value: unknown) => {
  if (isNullish(value) || isEmptyString(value) || isEmptyArray(value)) {
    return true
  }

  if (Array.isArray(value) && value.length < max) {
    return true
  }

  if (typeof value === 'string' && value.length < max) {
    return true
  }

  return `${property} must be less than ${max}`
}

export const isLessThanOrEqual = (max: number): ValidationMethodFactory => (property: string) => (value: unknown) => {
  if (isNullish(value) || isEmptyString(value) || isEmptyArray(value)) {
    return true
  }

  if (Array.isArray(value) && value.length <= max) {
    return true
  }

  if (typeof value === 'string' && value.length <= max) {
    return true
  }

  return `${property} must be less than or equal to ${max}`
}

export const isGreaterThan = (max: number): ValidationMethodFactory => (property: string) => (value: unknown) => {
  if (isNullish(value) || isEmptyString(value) || isEmptyArray(value)) {
    return true
  }

  if (Array.isArray(value) && value.length > max) {
    return true
  }

  if (typeof value === 'string' && value.length > max) {
    return true
  }

  return `${property} must be less than ${max}`
}

export const isGreaterThanOrEqual = (max: number): ValidationMethodFactory => (property: string) => (value: unknown) => {
  if (isNullish(value) || isEmptyString(value) || isEmptyArray(value)) {
    return true
  }

  if (Array.isArray(value) && value.length >= max) {
    return true
  }

  if (typeof value === 'string' && value.length >= max) {
    return true
  }

  return `${property} must be less than or equal to ${max}`
}

export const isBefore = (max: Date, { time: showTime = false } = {}): ValidationMethodFactory => (property: string): ValidationMethod => {
  return (value: unknown) => {
    if (isNullish(value)) {
      return true
    }

    if (isDate(value) && isDateBefore(value, max)) {
      return true
    }

    if (showTime) {
      return `${property} must be less than ${formatDateTimeNumeric(max)}`
    }

    return `${property} must be less than ${formatDate(max)}`
  }
}

export const isBeforeOrEqual = (max: Date, { time: showTime = false } = {}): ValidationMethodFactory => (property: string) => (value: unknown) => {
  if (isNullish(value)) {
    return true
  }

  if (isDate(value) && isDateBeforeOrEqual(value, max)) {
    return true
  }

  if (showTime) {
    return `${property} must be less than ${formatDateTimeNumeric(max)}`
  }

  return `${property} must be less than or equal to ${formatDate(max)}`
}

export const isAfter = (max: Date, { time: showTime = false } = {}): ValidationMethodFactory => (property: string) => (value: unknown) => {
  if (isNullish(value)) {
    return true
  }

  if (isDate(value) && isDateAfter(value, max)) {
    return true
  }

  if (showTime) {
    return `${property} must be less than ${formatDateTimeNumeric(max)}`
  }

  return `${property} must be less than ${formatDate(max)}`
}

export const isAfterOrEqual = (max: Date, { time: showTime = false } = {}): ValidationMethodFactory => (property: string) => (value: unknown) => {
  if (isNullish(value)) {
    return true
  }

  if (isDate(value) && isDateAfterOrEqual(value, max)) {
    return true
  }

  if (showTime) {
    return `${property} must be less than ${formatDateTimeNumeric(max)}`
  }

  return `${property} must be less than or equal to ${formatDate(max)}`
}

export const isJson: ValidationMethodFactory = (property: string) => (value: unknown) => {
  if (isNullish(value) || isEmptyString(value)) {
    return true
  }

  try {
    JSON.parse(value as string)
  } catch {
    return `${property} must be valid JSON`
  }

  return true
}

const HANDLE_REGEX = /^[a-z0-9-]+$/

export const isHandle: ValidationMethodFactory = (property: string) => value => {
  if (isNullish(value) || isEmptyString(value)) {
    return true
  }

  if (typeof value === 'string' && HANDLE_REGEX.test(value)) {
    return true
  }

  return `${property} must only contain lowercase letters, numbers, and dashes`
}