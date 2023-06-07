import type { RequestHandler } from 'express'
import * as R from 'ramda'

import Logger from '../utils/logger'
import { data } from '../utils/types'

const logger = new Logger()

export interface IError {
  status: number
  title: string
  detail: string
  meta?: data
}

export const errorHandler =
  (handler: RequestHandler): RequestHandler =>
  async (req, res, next) => {
    try {
      await handler(req, res, next)
    } catch (error) {
      const internalError: IError =
        R.hasPath(['status'], error) &&
        R.hasPath(['title'], error) &&
        R.hasPath(['detail'], error)
          ? (error as IError)
          : {
              status: 500,
              title: 'InternalServerError',
              detail: 'An unexpected exception has occurred.',
              meta: { originalError: error },
            }

      internalError.meta = {
        ...internalError.meta,
        route: `${req.method} ${req.originalUrl}`,
      }

      logger.error(internalError)

      if (!res.headersSent)
        res.status(internalError.status).json({ error: internalError })
    }
  }

export const rethrow = (error: IError) => (catchedError: unknown) => {
  // Attaching the catched error
  error.meta = { ...error.meta, originalError: R.omit(['stack'], catchedError) }
  throw error
}
