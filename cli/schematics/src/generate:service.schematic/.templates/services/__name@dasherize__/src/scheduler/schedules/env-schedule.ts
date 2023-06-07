import Schedule from 'eensy/src/schedules/schedule'
import Logger from 'eensy/src/utils/logger'

import { env } from '@env'

const logger = new Logger()

export default class EnvSchedule extends Schedule {
  async timeoutCallback() {
    logger.debug(`Env is ${env}.`)
  }
}
