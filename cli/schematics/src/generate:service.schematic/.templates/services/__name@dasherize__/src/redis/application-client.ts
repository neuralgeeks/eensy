import Logger from 'eensy/src/utils/logger'
import { RedisClientType, createClient } from 'redis'

import environment from '@env'

const logger = new Logger()

const redisEnv = environment.redis.default

export default class ApplicationRedis {
  private static redis?: RedisClientType

  static async client() {
    if (!ApplicationRedis.redis) {
      const client = createClient({
        url: `redis://${redisEnv.host}:${redisEnv.port}`,
      })

      client.on('error', (err) => logger.error(err))

      await client.connect()
      ApplicationRedis.redis = client as RedisClientType
    }

    return ApplicationRedis.redis
  }

  static async disconnect() {
    await ApplicationRedis.redis?.disconnect()
  }
}
