import { spawn } from 'child_process'
import { join } from 'path'

import { env } from '@env'

import { serviceStartWindow } from '../config.json'
import { resetDatabase } from '../utils/database'

export default async () => {
  await resetDatabase()

  // start services
  global.__SERVICESFORK__ = spawn('ts-node', ['start.ts'], {
    cwd: join(__dirname, join('..', '..', '..', '..')),
    env: {
      PATH: process.env.PATH,
      NODE_ENV: env,
    },
  })

  //Waiting for services to start
  await new Promise((r) => setTimeout(r, serviceStartWindow))
}
