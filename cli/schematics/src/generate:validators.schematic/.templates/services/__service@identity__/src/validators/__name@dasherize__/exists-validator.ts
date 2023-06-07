import { ResourceNotFoundError } from 'eensy/dist/src/errors/common'
import type { Request } from 'express'

import <%= classify(name) %>Repository from '@repositories/<%= dasherize(name) %>-repository'

const <%= camelize(name) %>Repository = new <%= classify(name) %>Repository()

export default async function ExistsValidator(req: Request) {
  const <%= camelize(name) %> = await <%= camelize(name) %>Repository.show(req.params.id)
  if (!<%= camelize(name) %>) throw ResourceNotFoundError()
}
