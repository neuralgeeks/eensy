import request from 'supertest'

import config from '../config.json'

export async function login(email = config.email, password = config.password) {
  const { loginServiceUrl, loginRoute } = config

  const res = await request(loginServiceUrl)
    .post(loginRoute)
    .send({ email, password })

  return res.body.meta.token as string
}
