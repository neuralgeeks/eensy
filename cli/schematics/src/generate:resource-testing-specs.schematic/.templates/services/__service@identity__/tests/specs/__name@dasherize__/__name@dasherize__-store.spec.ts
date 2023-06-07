import * as R from 'ramda'
import request from 'supertest'

import config from '../../config.json'
import <%= camelize(name) %>Schema from '../../schemas/<%= dasherize(name) %>'
import { expectEntityMatch } from '../../utils/expect'
import { login } from '../../utils/auth'
import { singleSchema } from '../../utils/schema'

const route = '/<%= plural(camelize(name)) %>'

let token: string

beforeAll(async () => {
  token = await login()
})

describe(`POST ${route}`, () => {
  const { serviceUrl } = config
  const body = {}
  const requiredFields: string[] = []
  const publicFields: string[] = ['id']
  const uniqueFields: string[] = []
  const uniqueFieldsValues: {
    [key: string]: unknown
  } = {}

  function invokeStore(body: object) {
    return request(serviceUrl)
      .post(route)
      .set('Authorization', `Bearer ${token}`)
      .send(body)
  }

  it('No token should return 401', async () => {
    const res = await request(serviceUrl).post(route)
    expect(res.statusCode).toEqual(401)
  })

  describe('Does not break unique fields uniqueness', () => {
    for (const field of uniqueFields)
      it(`Should return 409 and not violate ${field} uniqueness`, async () => {
        const localBody = R.pick([field], uniqueFieldsValues)
        const res = await invokeStore(localBody)

        expect(res.statusCode).toEqual(409)
      })
  })

  describe('Missing required fields', () => {
    for (const field of requiredFields)
      it(`Missing ${field} should return 400`, async () => {
        const localBody = R.omit([field], body)

        const res = await invokeStore(localBody)

        expect(res.statusCode).toEqual(400)
      })
  })

  it('Should return 201 and store resource', async () => {
    const res = await invokeStore(body)

    expect(res.statusCode).toEqual(201)

    // check if resource was stored
    const resourceId = res.body.data.id
    await expectEntityMatch(
      `${route}/${resourceId}`,
      { ...R.pick(publicFields, body), id: resourceId },
      singleSchema(<%= camelize(name) %>Schema),
      token
    )
  })
})
