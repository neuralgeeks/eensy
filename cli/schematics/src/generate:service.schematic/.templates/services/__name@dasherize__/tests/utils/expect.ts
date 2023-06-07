import request from 'supertest'
import { z } from 'zod'

import { toMatchSchema } from './zod'
import config from '../config.json'

expect.extend({ toMatchSchema })

const { serviceUrl } = config

export async function expectEntityMatch(
  route: string,
  expectedEntity: Record<string, unknown>,
  schema: z.ZodSchema<unknown>,
  token: string
) {
  const res = await request(serviceUrl)
    .get(route)
    .set('Authorization', `Bearer ${token}`)

  expect(res.statusCode).toEqual(200)
  expect(res.body).toMatchSchema(schema)

  const entity = res.body.data

  for (const [key, value] of Object.entries(expectedEntity))
    expect(entity).toHaveProperty(key, value)
}

export async function expectEntityNotMatch(
  route: string,
  nonExpectedEntity: Record<string, unknown>,
  schema: z.ZodSchema<unknown>,
  token: string
) {
  const res = await request(serviceUrl)
    .get(route)
    .set('Authorization', `Bearer ${token}`)

  expect(res.statusCode).toEqual(200)
  expect(res.body).toMatchSchema(schema)

  const entity = res.body.data
  for (const [key, value] of Object.entries(nonExpectedEntity)) {
    expect(entity).toHaveProperty(key)
    expect(entity[key]).not.toEqual(value)
  }
}

export async function expectNotFound(route: string, token: string) {
  const res = await request(serviceUrl)
    .get(route)
    .set('Authorization', `Bearer ${token}`)

  expect(res.statusCode).toEqual(404)
}
