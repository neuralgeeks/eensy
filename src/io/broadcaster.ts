import * as R from 'ramda'
import { Server as SocketIOServer } from 'socket.io'

import Identifier from './identifier'
import Rule from './rule'
import Logger from '../utils/logger'
import { data } from '../utils/types'

const logger = new Logger()

const colors = {
  reset: '\x1b[0m',
  bfBroadcaster: '\u001b[32;1m',
}

export type Channel<Namespace extends string> = {
  name: Namespace
  rules: Rule[]
  identifier?: Identifier
}

export function channelFactoryBuilder<Namespace extends string>() {
  return (name: Namespace, rules: Rule[], identifier?: Identifier) =>
    ({ name, rules, identifier } as Channel<Namespace>)
}

export default abstract class Broadcaster<ChannelNamespace extends string> {
  private static io?: SocketIOServer

  setIO(io: SocketIOServer) {
    Broadcaster.io = io
  }

  abstract channels(): Channel<ChannelNamespace>[]

  searchChannel(name: ChannelNamespace) {
    return R.find(R.propEq('name', name))(this.channels())
  }

  broadcast(
    to: ChannelNamespace,
    event: string,
    data: data,
    identifier: string | number = ''
  ) {
    if (!Broadcaster.io) {
      logger.error(
        [
          `${colors.bfBroadcaster}BROADCASTER${colors.reset}`,
          'Could not broadcast data, io found undefined',
        ].join(' ')
      )
      return
    }

    const exists = R.any((channel) => channel.name === to, this.channels())

    if (exists) {
      Broadcaster.io.to(`${to}${identifier}`).emit(event, data)

      logger.info(
        `${colors.bfBroadcaster}BROADCASTER${colors.reset} broadcasted:`
      )

      logger.info({
        channel: to,
        event,
        data,
        identifier,
      })
    } else
      logger.error(
        [
          `${colors.bfBroadcaster}BROADCASTER${colors.reset}`,
          `Could not broadcast data, channel ${to} is not registered`,
        ].join(' ')
      )
  }
}
