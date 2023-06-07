import request from 'supertest'

import config from '../../config.json'
import <%= camelize(name) %>Schema from '../../schemas/<%= dasherize(name) %>'
import { login } from '../../utils/auth'
import { collectionSchema } from '../../utils/schema'
import { toMatchSchema } from '../../utils/zod'

expect.extend({ toMatchSchema })

const route = '/<%= plural(camelize(name)) %>'

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
    expect(res.body).toMatchSchema(collectionSchema(<%= camelize(name) %>Schema))
  })
})
