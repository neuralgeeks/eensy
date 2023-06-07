import { ChildProcess } from 'child_process'

import { z } from 'zod'

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchSchema(schema: z.ZodSchema<unknown>): R
    }
  }

  // eslint-disable-next-line no-var
  var __SERVICESFORK__: ChildProcess | undefined
}
