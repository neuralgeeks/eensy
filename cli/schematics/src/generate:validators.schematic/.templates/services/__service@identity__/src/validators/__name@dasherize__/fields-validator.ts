import { BadRequestError } from 'eensy/src/errors/common'
import { rethrow } from 'eensy/src/errors/error'
import type { Request } from 'express'
import * as R from 'ramda'
import { z } from 'zod'

export default function FieldsValidator(optionals: boolean) {
  return async function (req: Request) {
    const schema = z.promise(
      z.object({
        /**
         * Describe the entity fields here with zod.
         *
         * Remember make them optional if needed and `optionals` is true
         */
      })
    )

    const fields = {
      ...R.pick(
        [
          /**
           * List the fields to pick from the request here.
           */
        ],
        req.body
      ),
    }

    const validated = await schema
      .parseAsync(fields)
      .catch(rethrow(BadRequestError()))

    return { ...validated }
  }
}
