import Schedule from 'eensy/dist/src/schedules/schedule'
import Logger from 'eensy/dist/src/utils/logger'

import { env } from '@env'

const logger = new Logger()

export default class EnvSchedule extends Schedule {
  async timeoutCallback() {
    logger.debug(`Env is ${env}.`)
  }
}
