import { join } from 'path'

import * as dotenv from 'dotenv'
import * as dotenvExpand from 'dotenv-expand'

export type Env = 'development' | 'production'

dotenvExpand.expand(
  dotenv.config({
    path: join(__dirname, '..', '.env'),
  })
)

export const env = (process.env.NODE_ENV ?? 'development') as Env

/**
 * dotenvVariables holds parameters specified on .env.
 *
 * It can be used to abstract any desired variables that
 * might be specified on the .env file.
 *
 * .env variables might be security sensitive.
 *
 * It is not necceary to abstract all of the variables
 * specified on the .env file.
 */
const dotenvVariables = {
  redis: {
    host: process.env.REDIS_DEFAULT_HOST ?? '',
    port: process.env.REDIS_DEFAULT_PORT ?? '',
  },
}

export default {
  ...dotenvVariables,

  // Add any other variables that are not security sensitive

  hashname: '<%= dasherize(name) %>.config',
  dependantServices: [],
}
