/* eslint-disable @typescript-eslint/no-unused-vars */

import Logger from '../utils/logger'

let logger = new Logger(
  // Override settings for all future logger instances
  {
    ...Logger.settings,
    instanceName: 'broadcasting.service:1678',
  },
  (l: Logger) => {
    // Do something statically for all future logger instances
  }
)

logger = new Logger()

logger.info({ a: 1, b: 2 })

logger.error({ a: 1, b: 2 }, [1, 2, 3])

class A {
  constructor() {
    logger.error('this is an error')
  }
}

const a = new A()
