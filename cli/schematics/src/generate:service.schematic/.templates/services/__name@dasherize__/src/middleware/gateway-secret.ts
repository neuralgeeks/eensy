import { ForbiddenError } from 'eensy/dist/src/errors/common'
import { NextFunction, Request, Response } from 'express'

import environment from '@env'

export default function GatewaySecret(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const secret = req.get('x-gateway-secret')
  if (secret !== environment.serviceSecret)
    throw ForbiddenError('Invalid gateway secret')

  delete req.headers['x-gateway-secret']
  next()
}
