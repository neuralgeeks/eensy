import Logger from 'eensy/dist/src/utils/logger'
import { NextFunction, Request, Response } from 'express'

const logger = new Logger()

export default function Logging(
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.info(`incoming ${req.method} ${req.originalUrl} request`)
  next()
}
