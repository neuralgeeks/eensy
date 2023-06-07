import { RedisClientType } from 'redis'

import { Properties, hashname } from './properties.type'

interface ApplicationRedis {
  client(): Promise<RedisClientType>
}

export default class ClusterConfiguration {
  applicationRedis: ApplicationRedis

  constructor(applicationRedis: ApplicationRedis) {
    this.applicationRedis = applicationRedis
  }

  async getProperty<T extends keyof Properties>(
    property: T
  ): Promise<Properties[T]> {
    const client = await this.applicationRedis.client()
    const propertyValue = await client.hGet(hashname, property)
    if (!propertyValue)
      throw `Configuration contract error: Property ${property} not found`

    return JSON.parse(propertyValue) as Properties[T]
  }
}
