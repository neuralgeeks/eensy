import type { Request, Response, Router } from 'express'
import httpProxy from 'http-proxy'
import * as R from 'ramda'

import type { HttpMethod, Route } from './method'
import { errorHandler } from '../errors/error'
import type { HTTPService } from '../io/http-service'

export type Gateway = (
  router: Router
) => (options: {
  proxy: httpProxy
  routeOffset: number
}) => (
  ...services: HTTPService[]
) => (...routes: string[]) => (...methods: HttpMethod[]) => Route

export const gateway: Gateway =
  (router) =>
  (
    { proxy, routeOffset } = {
      proxy: httpProxy.createProxyServer(),
      routeOffset: 2,
    }
  ) =>
  (...services) =>
  (...routes) =>
  (...methods) =>
  (...middleware) => {
    const combinations = R.xprod(R.xprod(routes, methods), services)

    for (const combination of combinations) {
      const [[route, method], service] = combination

      router[method](
        `/${service.name}${route}`,
        middleware.map((m) => errorHandler(m)),
        errorHandler(async (req: Request, res: Response) => {
          const [servicePrefix, ...rest] = R.drop(
            routeOffset,
            req.originalUrl.split('/')
          )

          if (servicePrefix !== service.name)
            throw {
              status: 500,
              title: 'GatewayMisconfiguration',
              detail:
                'Invalid service prefix. Gateway route offset misconfiguration.',
              meta: { expected: service.name, got: servicePrefix },
            }

          const redirect = `${service.url}/${rest.join('/')}`
          req.headers = { ...req.headers, ...(await service.getHeaders()) }

          if (redirect)
            proxy.web(req, res, {
              target: redirect,
              changeOrigin: true,
              ignorePath: true,
            })
        })
      )
    }
  }
