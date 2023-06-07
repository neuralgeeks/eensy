import { routingFactory } from 'eensy/dist/src/routing'
import { Router } from 'express'

import controllerFactory from '@controllers/<%= dasherize(name) %>-controller'

const router = Router()
const routing = routingFactory(router, controllerFactory)

routing.group()(
  routing.get('/', 'index'),
  routing.get('/:id', 'show'),
  routing.post('/', 'store'),
  routing.put('/:id', 'update'),
  routing.delete('/:id', 'destroy')
)

export default router
