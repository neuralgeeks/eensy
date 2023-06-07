import { CronJob } from 'cron'

import Schedule from './schedule'
import Logger from '../utils/logger'

const logger = new Logger()

const colors = {
  reset: '\x1b[0m',
  bfScheduler: '\u001b[34;1m',
  bfSchedule: '\u001b[36;1m',
  bfMethod: '\u001b[35;1m',
}

export default abstract class Scheduler {
  abstract schedules(): Schedule[]

  start() {
    for (const s of this.schedules()) this.setupSchedule(s)
  }

  private setupSchedule(schedule: Schedule) {
    this.setupCron(schedule)
    this.setupInterval(schedule)
    this.setupTimeout(schedule)
  }

  private setupCron(schedule: Schedule) {
    if (!schedule.cron) return

    const job = new CronJob(schedule.cron, () => {
      logger.info(
        [
          `${colors.bfScheduler}SCHEDULER${colors.reset} Executing`,
          `${colors.bfSchedule}${schedule.name}${colors.reset} scheduled`,
          `${colors.bfMethod}cronjob${colors.reset} callback`,
        ].join(' ')
      )

      schedule.cronCallback()
    })

    job.start()
  }

  private setupInterval(schedule: Schedule) {
    if (!schedule.interval) return

    setInterval(() => {
      logger.info(
        [
          `${colors.bfScheduler}SCHEDULER${colors.reset} Executing`,
          `${colors.bfSchedule}${schedule.name}${colors.reset} scheduled`,
          `${colors.bfMethod}interval${colors.reset} callback`,
        ].join(' ')
      )

      schedule.intervalCallback()
    }, schedule.interval)
  }

  private setupTimeout(schedule: Schedule) {
    if (!schedule.timeout) return

    setTimeout(() => {
      logger.info(
        [
          `${colors.bfScheduler}SCHEDULER${colors.reset} Executing`,
          `${colors.bfSchedule}${schedule.name}${colors.reset} scheduled`,
          `${colors.bfMethod}timeout${colors.reset} callback`,
        ].join(' ')
      )

      schedule.timeoutCallback()
    }, schedule.timeout)
  }
}
