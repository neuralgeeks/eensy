import * as R from 'ramda'
import { Server as SocketIOServer, Socket as SocketIOSocket } from 'socket.io'

import Broadcaster from './broadcaster'
import Logger from '../utils/logger'
import { data } from '../utils/types'

const logger = new Logger()

const colors = {
  reset: '\x1b[0m',
  bgBroadcaster: '\u001b[44m',
}

export default class SocketIOManager<
  BroadcasterChannelNamespace extends string
> {
  protected broadcaster: Broadcaster<BroadcasterChannelNamespace>
  protected io: SocketIOServer

  constructor(
    io: SocketIOServer,
    broadcaster: Broadcaster<BroadcasterChannelNamespace>
  ) {
    this.broadcaster = broadcaster
    this.io = io

    this.broadcaster.setIO(io)
  }

  setup() {
    this.io.on('connection', (socket) => {
      logger.info(`Socket ${socket.id} has connected to server`)
      socket.on('subscribe-client', async (data: data) => {
        await this.setupBroadcaster(socket, data)
      })

      socket.on('disconnect', () => {
        logger.info(`Socket ${socket.id} has disconnected from server`)
      })
    })
  }

  async setupBroadcaster(socket: SocketIOSocket, data: data) {
    for (const channel of this.broadcaster.channels()) {
      const evaluations = channel.rules.map((rule) => rule.eval(data))
      const results = await Promise.all(evaluations)
      const canJoin = R.all(R.identity, results)

      if (canJoin) {
        const identity = (await channel.identifier?.resolveIdentity(data)) || ''

        // Joining to broadcast part of the channel
        socket.join(channel.name)

        // Joining to personal part of the channel
        if (identity !== '') socket.join(`${channel.name}${identity}`)

        logger.info(
          [
            `${colors.bgBroadcaster}BROADCASTER${colors.reset}`,
            `Socket ${socket.id} is joining ${channel.name} brodcaster channel`,
            identity !== ''
              ? `and ${channel.name}${identity} personal channel`
              : '',
          ].join(' ')
        )
      }
    }
  }
}
