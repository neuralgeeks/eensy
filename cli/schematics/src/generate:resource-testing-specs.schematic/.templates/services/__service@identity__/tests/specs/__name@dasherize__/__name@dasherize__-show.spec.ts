import request from 'supertest'

import config from '../../config.json'
import <%= camelize(name) %>Schema from '../../schemas/<%= dasherize(name) %>'
import { login } from '../../utils/auth'
import { expectNotFound } from '../../utils/expect'
import { singleSchema } from '../../utils/schema'
import { toMatchSchema } from '../../utils/zod'

expect.extend({ toMatchSchema })

const validId = 'facade01-0000-4000-a000-000000000000'
const invalidId = 'facade01-0000-4000-a000-111111111111'
const route = `/<%= plural(camelize(name)) %>/${validId}`

let token: string

beforeAll(async () => {
  token = await login()
})

describe(`GET ${route}`, () => {
  const { serviceUrl } = config

  it('No token should return 401', async () => {
    const res = await request(serviceUrl).get(route)
    expect(res.statusCode).toEqual(401)
  })

  it('Should return 200 and match schema', async () => {
    const res = await request(serviceUrl)
      .get(route)
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchSchema(singleSchema(<%= camelize(name) %>Schema))
    expect(res.body.data).toHaveProperty('id', validId)
  })

  it('Should return 404 if resource does not exist', async () =>
    expectNotFound(`/<%= plural(camelize(name)) %>/${invalidId}`, token))
})
