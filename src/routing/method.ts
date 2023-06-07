import type { NextFunction, Request, Response, Router } from 'express'

import { errorHandler } from '../errors/error'
import type { Controller, RouteHandler } from '../patterns/controller'
import Logger from '../utils/logger'

const logger = new Logger()

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void
export type Route = (...middleware: Middleware[]) => void

export type Method<T extends Controller> = (
  route: string,
  handler: {
    [key in keyof T]: T[key] extends RouteHandler ? key : never
  }[keyof T]
) => Route

export type HttpMethod = 'post' | 'get' | 'put' | 'patch' | 'delete'

export const method =
  <T extends Controller>(
    router: Router,
    controllerFactory: (req: Request, res: Response) => T,
    httpMethod: HttpMethod
  ): Method<T> =>
  (route, handler) =>
  (...middleware) => {
    router[httpMethod](
      route,
      middleware.map((m) => errorHandler(m)),
      errorHandler(async (req: Request, res: Response) => {
        const controller = controllerFactory(req, res)
        const output = await (controller[handler] as RouteHandler)(req, res)

        const { method, originalUrl } = req

        // Case: void
        if (typeof output !== 'object' && !res.headersSent)
          res.status(200).send()

        if (res.headersSent) {
          logger.debug(
            `${method} ${originalUrl} response sent with status ${res.statusCode}`
          )
          return
        }

        // Case: { status, data }
        const { status, data, ...rest } = output as Exclude<typeof output, void>

        if (!res.headersSent)
          data || Object.keys(rest).length
            ? res.status(status ?? 200).json({ data, ...rest })
            : res.status(status ?? 200).send()

        logger.debug(
          `${method} ${originalUrl} response sent with status ${status ?? 200}`
        )
      })
    )
  }
