import { ResourceNotFoundError } from 'eensy/src/errors/common'
import { Controller } from 'eensy/src/patterns/controller'
import { collection } from 'eensy/src/patterns/transform'
import { Request, Response } from 'express'

import { <%= classify(name) %> } from '@prisma-generated/client'
import <%= classify(name) %>Repository from '@repositories/<%= dasherize(name) %>-repository'
import <%= classify(name) %>Transform from '@transforms/<%= dasherize(name) %>-transform'
import ExistsValidator from '@validators/<%= dasherize(name) %>/exists-validator'
import IndexValidator from '@validators/<%= dasherize(name) %>/index-validator'
import ReferenceValidator from '@validators/<%= dasherize(name) %>/reference-validator'
import StoreValidator from '@validators/<%= dasherize(name) %>/store-validator'
import UpdateValidator from '@validators/<%= dasherize(name) %>/update-validator'

const <%= camelize(name) %>Repository = new <%= classify(name) %>Repository()

class <%= classify(name) %>Controller extends Controller {
  async index(req: Request) {
    await IndexValidator(req)
    const all = await <%= camelize(name) %>Repository.all()

    return { data: collection(<%= classify(name) %>Transform, all) }
  }

  async show(req: Request) {
    const validated = await ReferenceValidator(req)
    const <%= camelize(name) %> = await <%= camelize(name) %>Repository.show(validated.id)
    if (!<%= camelize(name) %>) throw ResourceNotFoundError()

    return { data: <%= classify(name) %>Transform(<%= camelize(name) %>) }
  }

  async store(req: Request) {
    const validated = await StoreValidator(req)
    const <%= camelize(name) %> = await <%= camelize(name) %>Repository.create(validated as <%= classify(name) %>)
    return { status: 201, data: <%= classify(name) %>Transform(<%= camelize(name) %>) }
  }

  async update(req: Request) {
    const validated = await UpdateValidator(req)
    await ExistsValidator(req)

    const <%= camelize(name) %> = await <%= camelize(name) %>Repository.update(validated.id, validated.fields)
    return { status: 202, data: <%= classify(name) %>Transform(<%= camelize(name) %>) }
  }

  async destroy(req: Request) {
    const validated = await ReferenceValidator(req)
    await ExistsValidator(req)

    await <%= camelize(name) %>Repository.delete(validated.id)
    return { status: 202 }
  }
}

export default function controllerFactory(req: Request, res: Response) {
  return new <%= classify(name) %>Controller(req, res)
}
