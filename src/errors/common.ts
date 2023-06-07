import { IError } from './error'

export const BadRequestError = (reason?: string): IError => ({
  status: 400,
  title: 'badRequest',
  detail: 'The request body was invalid',
  ...(reason && { meta: { reason } }),
})

export const ResourceNotFoundError = (): IError => ({
  status: 404,
  title: 'notFound',
  detail: 'Requested resource not found',
})

export const ConflictError = (detail: string): IError => ({
  status: 409,
  title: 'conflict',
  detail,
})

export const ForbiddenError = (detail: string): IError => ({
  status: 403,
  title: 'Forbidden',
  detail,
})

export const UnauthorizedError = (detail: string): IError => ({
  status: 401,
  title: 'unauthorized',
  detail,
})

export namespace JWTErrors {
  export const BadJWTError = (token: string): IError => ({
    status: 400,
    title: 'badJWT',
    detail: 'The request cannot be authorized due to bad JWT Authorization',
    meta: {
      givenToken: token,
    },
  })

  export const InvalidJWTError = (token: string): IError => ({
    status: 403,
    title: 'invalidJWT',
    detail:
      'The request cannot be authorized, the given JWT was invalid or has expirated',
    meta: {
      givenToken: token,
    },
  })

  export const MissingJWTError = (): IError => ({
    status: 400,
    title: 'missingJWT',
    detail: 'Bad request, there was no authorization JWT specified',
  })
}
