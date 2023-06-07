import { z } from 'zod'

export function singleSchema(schema: z.ZodSchema<unknown>) {
  return z.object({
    data: schema,
  })
}

export function collectionSchema(schema: z.ZodSchema<unknown>) {
  return z.object({
    data: z.array(schema),
  })
}
