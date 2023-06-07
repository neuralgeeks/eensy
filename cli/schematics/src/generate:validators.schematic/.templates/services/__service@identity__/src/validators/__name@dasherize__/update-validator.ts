import type { Request } from 'express'

import FieldsValidator from './fields-validator'
import ReferenceValidator from './reference-validator'

const OptionalFieldsValidator = FieldsValidator(true)

export default async function UpdateValidator(req: Request) {
  const ref = await ReferenceValidator(req)
  const store = await OptionalFieldsValidator(req)

  return { ...ref, fields: store }
}
