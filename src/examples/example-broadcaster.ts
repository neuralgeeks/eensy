/* eslint-disable import/order */

import { data } from '../utils/types'

//------------- Identifier

import { BearerJWT } from '../utils/jwt'
import Identifier from '../io/identifier'

class JWTIdentifier extends Identifier {
  protected async body(data: data) {
    return BearerJWT.decodeBearerScheme(data.authorization as string)
  }

  protected async identify(body: data) {
    return body.decoded.user as string
  }
}

//------------- Rule

import { z } from 'zod'
import Rule from '../io/rule'

class JWTRule extends Rule {
  constructor() {
    super()
    this.name = 'JWT Bearer authorization rule'
  }

  protected async body(data: data) {
    const schema = z.promise(
      z.object({
        authorization: z.string().trim(),
      })
    )

    const body = {
      authorization: data.authorization,
    }

    return await schema.parse(body)
  }

  protected async predicate(data: data) {
    // Just validate JWT Bearer scheme
    BearerJWT.decodeBearerScheme(data.authorization as string)

    // In a real app verifyUserToken will be called
    return true
  }
}

//------------- Application broadcaster

import Broadcaster, { channelFactoryBuilder } from '../io/broadcaster'

export type BroadcasterChannelNamespace =
  | 'users'
  | 'spirit'
  | 'gravestone'
  | 'runner'

const channel = channelFactoryBuilder<BroadcasterChannelNamespace>()

export default class ApplicationBroadcaster extends Broadcaster<BroadcasterChannelNamespace> {
  channels() {
    return [
      channel('users', [new JWTRule()], new JWTIdentifier()),
      channel('spirit', []),
      channel('gravestone', []),
      channel('runner', [new JWTRule()]),
    ]
  }
}

//------------- using the broadcaster

const broadcaster = new ApplicationBroadcaster()

broadcaster.broadcast('runner', 'runner-game.new-withdraw', {
  bet: { id: 'facade01-0000-4000-a000-000000000000', amount: 100 },
})

broadcaster.broadcast(
  'users',
  'spirit.spook.queue.job.completed',
  {
    successfulSpook: true,
    spiritId: 123,
    userId: 'facade01-0000-4000-a000-000000000000',
  },
  'facade01-0000-4000-a000-000000000000'
)

//------------- app.ts broadcasting setup

import express from 'express'
import http from 'http'

const app = express()
const server = new http.Server(app)

// ...

//------------------------ socket --------------------------//
import { Server as SocketIOServer } from 'socket.io'
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
  },
})

import SocketIOManager from '../io/socket.io-manager'
// import ApplicationBroadcaster, {
//   BroadcasterChannelNamespace
// } from './src/broadcaster/ApplicationBroadcaster'

const socketIOManager = new SocketIOManager<BroadcasterChannelNamespace>(
  io,
  new ApplicationBroadcaster()
)
socketIOManager.setup()
