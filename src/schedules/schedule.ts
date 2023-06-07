import { isValidCron } from 'cron-validator'

import Logger from '../utils/logger'
const logger = new Logger()

export default class Schedule {
  name: string
  cron?: string
  timeout?: number
  interval?: number

  constructor(
    name: string,
    {
      cron,
      timeout,
      interval,
    }: { cron?: string; timeout?: number; interval?: number }
  ) {
    this.name = name
    this.cron = this.validateCronPattern(cron)
    this.timeout = this.validateTimed('timeout', timeout)
    this.interval = this.validateTimed('interval', interval)
  }

  async cronCallback(): Promise<void> {
    return
  }

  async intervalCallback(): Promise<void> {
    return
  }

  async timeoutCallback(): Promise<void> {
    return
  }

  private validateCronPattern(cron?: string): string | undefined {
    if (!cron) return undefined

    if (!isValidCron(cron, { seconds: true })) {
      logger.error(
        `Found invalid cron value for ${this.name}, cronjob callback will never be executed`
      )
      return undefined
    }

    return cron
  }

  private validateTimed(
    validate: 'interval' | 'timeout',
    timed?: number
  ): number | undefined {
    if (!timed) return undefined

    if (isNaN(timed)) {
      logger.error(
        `Found NaN ${validate} for ${this.name}, ${validate} callback will never be executed`
      )
      return undefined
    }

    return timed
  }
}
