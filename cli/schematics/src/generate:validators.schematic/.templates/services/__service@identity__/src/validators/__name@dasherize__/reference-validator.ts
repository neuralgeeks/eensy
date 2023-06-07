import { BadRequestError } from 'eensy/dist/src/errors/common'
import { rethrow } from 'eensy/dist/src/errors/error'
import type { Request } from 'express'
import { z } from 'zod'

export default async function ReferenceValidator(req: Request) {
  const schema = z.promise(
    z.object({
      id: z.string().uuid(),
    })
  )

  const fields = {
    id: req.params.id,
  }

  const validated = await schema
    .parseAsync(fields)
    .catch(rethrow(BadRequestError()))

  return { ...validated }
}
