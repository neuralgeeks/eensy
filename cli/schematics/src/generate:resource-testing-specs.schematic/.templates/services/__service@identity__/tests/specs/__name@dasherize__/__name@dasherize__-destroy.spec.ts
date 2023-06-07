import request from 'supertest'

import config from '../../config.json'
import { login } from '../../utils/auth'
import { expectNotFound } from '../../utils/expect'

const validId = 'facade01-0000-4000-a000-000000000000'
const invalidId = 'facade01-0000-4000-a000-111111111111'
const route = `/<%= plural(camelize(name)) %>/${validId}`

let token: string

beforeAll(async () => {
  token = await login()
})

describe(`DELETE ${route}`, () => {
  const { serviceUrl } = config

  function invokeDestroy(route = `/<%= plural(camelize(name)) %>/${validId}`) {
    return request(serviceUrl)
      .delete(route)
      .set('Authorization', `Bearer ${token}`)
  }

  it('No token should return 401', async () => {
    const res = await request(serviceUrl).delete(route)
    expect(res.statusCode).toEqual(401)
  })

  it('Should return 202 and destroy the resource', async () => {
    const res = await invokeDestroy()

    expect(res.statusCode).toEqual(202)

    expectNotFound(route, token)
  })

  it('Should return 404 if resource does not exist', async () => {
    const res = await invokeDestroy(
      `/<%= plural(camelize(name)) %>/${invalidId}`
    )

    expect(res.statusCode).toEqual(404)
  })
})
