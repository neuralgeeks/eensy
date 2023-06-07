import cluster from 'cluster'
import http from 'http'
import os from 'os'

import { createAdapter } from '@socket.io/redis-adapter'
import cors from 'cors'
import express, { json } from 'express'
import * as R from 'ramda'
import { createClient } from 'redis'
import { Server as SocketIOServer } from 'socket.io'

import appargs from '../utils/appargs'
import { appLoggerFactory } from '../utils/logger'

// IGNORE THIS
export type Env = 'local' | 'development' | 'test' | 'production'
function env(process: NodeJS.Process): Env {
  return (process.env.NODE_ENV as Env) ?? 'development'
}

const app = express()
const server = new http.Server(app)

//------------- parse args
const { name, port, listen } = appargs(process)

//------------- cors
app.use(cors())

//------------- parsing body
app.use(json())

//------------- logging
// TODO: logging middleware

//------------- db connection
// TODO: prisma connection

//------------- healthcheck
app.get('/healthCheck', (req, res) => {
  res.json('ok')
})

//------------- routes
// ... Routes here

//------------- queues
const startQueues = () => {
  // ... Queues here
}

//------------- scheduler
// import ApplicationScheduler from './src/scheduler/scheduler'
// const appScheduler = new ApplicationScheduler()

//------------- socket.io
const pubClient = createClient({
  url: 'redis://${redisConfig.host}:${redisConfig.port}', // TODO: get from config
})
const subClient = pubClient.duplicate()

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
  },
})
// import ApplicationBroadcaster, {
//   BroadcasterChannelNamespace
// } from './src/broadcaster/ApplicationBroadcaster'

// const socketIOManager = new SocketIOManager<BroadcasterChannelNamespace>(
//   io,
//   new ApplicationBroadcaster()
// )
// socketIOManager.setup()

//------------- keep alive
server.keepAliveTimeout = 65000
server.headersTimeout = 66000

//------------- starting the app
const start = () => {
  const productionMode = env(process) === 'production'
  const nWorkers = productionMode ? os.cpus().length : 1

  if (cluster.isPrimary) {
    R.range(0, nWorkers).forEach(cluster.fork)

    appLoggerFactory(`${name}:${port} - main`, productionMode)

    // appScheduler.start()
  } else {
    const logger = appLoggerFactory(
      `${name}:${port} - ${process.pid}`,
      productionMode
    )

    io.adapter(createAdapter(pubClient, subClient))

    startQueues()

    app.listen(port, () => {
      logger.info(`service started in port ${port}`)
    })
  }
}

if (listen) Promise.all([pubClient.connect(), subClient.connect()]).then(start)

export default app
