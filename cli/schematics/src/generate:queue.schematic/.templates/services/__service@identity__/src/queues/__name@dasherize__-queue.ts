import Bull from 'bull'
import Logger from 'eensy/src/utils/logger'

import environment from '@env'

const logger = new Logger()

const name = '<%= dasherize(name) %>'
const <%= camelize(name) %>Queue = new Bull(name, {
  redis: {
    host: environment.redis.default.host,
    port: Number(environment.redis.default.port),
  },
  defaultJobOptions: {
    attempts: 20,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: true,
  },
})

async function onProcess(job: Bull.Job) {

}

export async function start<%= classify(name) %>Queue() {
  logger.info(`${name} queue started processing`)

  <%= camelize(name) %>Queue.process(async (job) => {
    try {
      await onProcess(job)
    } catch (e) {
      logger.error(e)
      throw e
    }
  })
}

export default <%= camelize(name) %>Queue
