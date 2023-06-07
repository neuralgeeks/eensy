import * as R from 'ramda'
import request from 'supertest'

import config from '../../config.json'
import <%= camelize(name) %>Schema from '../../schemas/<%= dasherize(name) %>'
import { resetDatabase } from '../../utils/database'
import {
  expectEntityMatch,
  expectEntityNotMatch,
  expectNotFound,
} from '../../utils/expect'
import { login } from '../../utils/auth'
import { singleSchema } from '../../utils/schema'

const validId = 'facade01-0000-4000-a000-000000000000'
const invalidId = 'facade01-0000-4000-a000-111111111111'
const route = `/<%= plural(camelize(name)) %>/${validId}`

let token: string

beforeAll(async () => {
  token = await login()
})

describe(`PUT ${route}`, () => {
  const { serviceUrl } = config
  const body = {
    id: invalidId,
  }
  const mutableFields: string[] = []
  const inmutableFields: string[] = ['id']
  const publicFields: string[] = ['id']
  const uniqueFields: string[] = []
  const uniqueFieldsValues: {
    [key: string]: unknown
  } = {}

  function invokeUpdate(body: object) {
    return request(serviceUrl)
      .put(route)
      .set('Authorization', `Bearer ${token}`)
      .send(body)
  }

  it('No token should return 401', async () => {
    const res = await request(serviceUrl).put(route)
    expect(res.statusCode).toEqual(401)
  })

  it('Should return 404 if resource does not exist', async () =>
    expectNotFound(`/<%= plural(camelize(name)) %>/${invalidId}`, token))

  describe('Does not break unique fields uniqueness', () => {
    for (const field of uniqueFields)
      it(`Should return 409 and not violate ${field} uniqueness`, async () => {
        const localBody = R.pick([field], uniqueFieldsValues)
        const res = await invokeUpdate(localBody)

        expect(res.statusCode).toEqual(409)

        // check that resource was not updated
        await expectEntityNotMatch(
          route,
          R.pick(publicFields, localBody),
          singleSchema(<%= camelize(name) %>Schema),
          token
        )
      })
  })

  describe('Does not update inmutable fields', () => {
    for (const field of inmutableFields)
      it(`Should return 202 and not update ${field}`, async () => {
        const localBody = R.pick([field], body)
        const res = await invokeUpdate(localBody)

        expect(res.statusCode).toEqual(202)

        // check that resource was not updated
        await expectEntityNotMatch(
          route,
          R.pick(publicFields, localBody),
          singleSchema(<%= camelize(name) %>Schema),
          token
        )
      })
  })

  describe('Individually updates mutable fields', () => {
    for (const field of mutableFields)
      it(`Should return 202 and update ${field}`, async () => {
        const localBody = R.pick([field], body)
        const res = await invokeUpdate(localBody)

        expect(res.statusCode).toEqual(202)

        // check that resource was updated
        await expectEntityMatch(
          route,
          R.pick(publicFields, localBody),
          singleSchema(<%= camelize(name) %>Schema),
          token
        )
      })
  })

  it('Should return 202 and update all mutable fields', async () => {
    await resetDatabase()
    const localBody = R.pick(mutableFields, body)
    const res = await invokeUpdate(localBody)

    expect(res.statusCode).toEqual(202)

    // check that resource was updated
    await expectEntityMatch(
      route,
      R.pick(publicFields, localBody),
      singleSchema(<%= camelize(name) %>Schema),
      token
    )
  })
})
