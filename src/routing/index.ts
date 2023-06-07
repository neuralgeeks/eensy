import type { Request, Response, Router } from 'express'

import { gateway } from './gateway'
import { group, subgroup } from './group'
import { http } from './http'
import type { Controller } from '../patterns/controller'

export const routingFactory = <T extends Controller>(
  router: Router,
  controllerFactory: (req: Request, res: Response) => T
) => ({
  ...http(router, controllerFactory),
  group,
  subgroup,
  gateway: gateway(router),
})
