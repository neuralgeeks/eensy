import Scheduler from 'eensy/dist/src/schedules/scheduler'

import EnvSchedule from './schedules/env-schedule'

export default class ApplicationScheduler extends Scheduler {
  schedules() {
    return [new EnvSchedule('Env', { timeout: 1000 })]
  }
}
