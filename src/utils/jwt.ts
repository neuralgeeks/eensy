import { Request } from 'express'
import * as jwt from 'jsonwebtoken'
import * as uuid from 'uuid'

import { JWTErrors, UnauthorizedError } from '../errors/common'

const defaultIndexIsValid = <ID extends string | number>(id: ID) =>
  typeof id === 'string' ? uuid.validate(id) : !isNaN(id)

export namespace BearerJWT {
  export const decodeBearerScheme = (authorization: string) => {
    const [authScheme, token] = authorization.trim().split(' ')

    if (authScheme !== 'Bearer')
      throw `Wrong auth scheme, expected Bearer. given: ${authScheme}`

    if (!token) throw 'Missing JWT.'

    let decoded = null
    try {
      decoded = jwt.decode(token)
    } catch {
      throw 'Bad JWT.'
    }

    if (!decoded) throw 'Bad JWT.'

    return {
      decoded: decoded as jwt.JwtPayload,
      token,
    }
  }

  export const verifyUserToken = async <ID extends string | number>(
    scheme: ReturnType<typeof decodeBearerScheme>,
    secretSource: (id: ID) => Promise<{ secret: string } | null>,
    indexProp = 'userId',
    indexIsValid = defaultIndexIsValid<ID>
  ) => {
    const id = scheme.decoded[indexProp]
    if (!indexIsValid(id))
      throw `Bad JWT. Indexing property '${id}' found invalid`

    const source = await secretSource(id)
    if (!source) throw 'Given JWT was invalid or has expirated'

    try {
      jwt.verify(scheme.token, source.secret)
    } catch {
      throw 'Given JWT was invalid or has expirated'
    }
  }
}

export namespace httpBearerJWT {
  export const decodeBearerScheme = (req: Request) => {
    const auth = req.get('Authorization')
    if (!auth) throw UnauthorizedError('Missing authorization')

    const [authScheme, token] = auth?.trim().split(' ') ?? []

    if (authScheme !== 'Bearer')
      throw UnauthorizedError(
        `Wrong auth scheme, expected Bearer. given: ${authScheme}`
      )

    if (!token) throw JWTErrors.MissingJWTError()

    let decoded = null
    try {
      decoded = jwt.decode(token)
    } catch {
      throw JWTErrors.BadJWTError(token)
    }

    if (!decoded) throw JWTErrors.BadJWTError(token)

    return {
      decoded: decoded as jwt.JwtPayload,
      token,
    }
  }

  export const verifyUserToken = async <ID extends string | number>(
    scheme: ReturnType<typeof decodeBearerScheme>,
    secretSource: (id: ID) => Promise<{ secret: string } | null>,
    indexProp = 'userId',
    indexIsValid = defaultIndexIsValid<ID>
  ) => {
    const id = scheme.decoded[indexProp]
    if (!indexIsValid(id)) throw JWTErrors.BadJWTError(scheme.token)

    const source = await secretSource(id)
    if (!source) throw JWTErrors.InvalidJWTError(scheme.token)

    try {
      jwt.verify(scheme.token, source.secret)
    } catch {
      throw JWTErrors.InvalidJWTError(scheme.token)
    }
  }
}
