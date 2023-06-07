import type { Request, Response, Router } from 'express'

import { HttpMethod, method } from './method'
import type { Controller } from '../patterns/controller'

export const http = <T extends Controller>(
  router: Router,
  controllerFactory: (req: Request, res: Response) => T
) => ({
  methods: ['post', 'get', 'put', 'patch', 'delete'] as HttpMethod[],
  post: method(router, controllerFactory, 'post'),
  get: method(router, controllerFactory, 'get'),
  put: method(router, controllerFactory, 'put'),
  patch: method(router, controllerFactory, 'patch'),
  delete: method(router, controllerFactory, 'delete'),
})
