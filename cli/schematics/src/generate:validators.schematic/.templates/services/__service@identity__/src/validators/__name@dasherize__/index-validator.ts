import { BadRequestError } from 'eensy/dist/src/errors/common'
import { rethrow } from 'eensy/dist/src/errors/error'
import type { Request } from 'express'
import { z } from 'zod'

export default async function IndexValidator(req: Request) {
  const schema = z.promise(
    z.object({
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).optional(),
    })
  )

  const fields = {
    page: req.body.page ?? 1,
    limit: req.body.limit ?? 10,
  }

  const validated = await schema
    .parseAsync(fields)
    .catch(rethrow(BadRequestError()))

  return { ...validated }
}
