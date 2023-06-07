import { z } from 'zod'

export function toMatchSchema(data: unknown, schema: z.ZodSchema<unknown>) {
  const result = schema.safeParse(data)
  if (result.success)
    return {
      pass: true,
      message: () => 'Success, data matches schema',
    }

  return {
    pass: false,
    message: () => JSON.stringify(result.error.format(), null, 2),
  }
}
