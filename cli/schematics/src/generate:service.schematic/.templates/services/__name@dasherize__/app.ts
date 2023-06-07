import cluster from 'cluster'
import http from 'http'
import os from 'os'

import { createAdapter } from '@socket.io/redis-adapter'
import cors from 'cors'
import { applicationRoutes } from 'eensy/src/routing/application'
import appargs from 'eensy/src/utils/appargs'
import { appLoggerFactory } from 'eensy/src/utils/logger'
import express, { json } from 'express'
import * as R from 'ramda'
import { createClient } from 'redis'
import { Server as SocketIOServer } from 'socket.io'

import environment, { env } from '@env'
import Logging from '@middleware/logging'
import ApplicationScheduler from '@scheduler/application-scheduler'

const app = express()
const server = new http.Server(app)

//------------- parse args
const { name, port, listen } = appargs(process)

//------------- cors
app.use(cors())

//------------- parsing body
app.use(json())

//------------- logging
app.use(Logging)

//------------- healthcheck
app.get('/healthCheck', (req, res) => res.json('ok'))

//------------- routes
const routes = applicationRoutes(app, __dirname)

//------------- queues
const startQueues = () => {
  // ... Queues here
}

//------------- scheduler
const appScheduler = new ApplicationScheduler()

//------------- socket.io
const redisEnv = environment.redis.default
const pubClient = createClient({
  url: `redis://${redisEnv.host}:${redisEnv.port}`,
})
const subClient = pubClient.duplicate()

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
  },
})

//------------- keep alive
server.keepAliveTimeout = 65000
server.headersTimeout = 66000

//------------- starting the app
const start = () => {
  const productionMode = env === 'production'
  const nWorkers = productionMode ? os.cpus().length : 1

  if (cluster.isPrimary) {
    R.range(0, nWorkers).forEach(cluster.fork)

    appLoggerFactory(`${name}:${port} - main`, productionMode)

    appScheduler.start()
  } else {
    const logger = appLoggerFactory(
      `${name}:${port} - ${process.pid}`,
      productionMode
    )

    io.adapter(createAdapter(pubClient, subClient))

    startQueues()

    app.listen(port, () => {
      logger.info(`Env is ${env}.`, `Service started in port ${port}`)
    })
  }
}

if (listen)
  Promise.all([routes, pubClient.connect(), subClient.connect()]).then(start)

export default app
