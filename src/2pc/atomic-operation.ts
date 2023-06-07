import { Request, Response, Router } from 'express'
import { z } from 'zod'

import { BadRequestError, ConflictError } from '../errors/common'
import { rethrow } from '../errors/error'
import { Controller } from '../patterns/controller'
import Repository from '../patterns/repository'
import { Transform } from '../patterns/transform'
import { Validator } from '../patterns/validator'
import { routingFactory } from '../routing'
import { data } from '../utils/types'

const env = process.env.NODE_ENV || 'development'

export interface IAtomic2pcOp {
  id: string
  status: 'Prepared' | 'Committed' | 'Rollbacked'
}

export abstract class Atomic2pcOpRepository<
  T extends IAtomic2pcOp
> extends Repository<string, T> {
  abstract commit(op: T): Promise<void>
  abstract rollback(op: T): Promise<void>
}

async function Atomic2pcOpRefValidator(req: Request) {
  const schema = z.promise(
    z.object({
      tid: z.string().uuid(),
    })
  )

  const fields = {
    tid: req.params.tid,
  }

  const validated = await schema.parse(fields).catch(rethrow(BadRequestError()))

  return validated
}

function atomic2pcOpControllerFactory<T extends IAtomic2pcOp>(
  Repository: new () => Atomic2pcOpRepository<T>,
  AtomicTransform: Transform<T, data>,
  PrepareValidator: Validator
) {
  class Atomic2pcOpController extends Controller {
    repository = new Repository()

    async prepare(req: Request, res: Response) {
      const validated = await PrepareValidator(req, res)

      //---------------------- getting operation
      let operation = await this.repository.show(validated.tid)

      //---------------------- case: operation exists
      if (operation)
        await Promise.all([
          operation.status === 'Committed'
            ? this.repository.rollback(operation)
            : Promise.resolve(),
          this.repository.update(validated.tid, {
            status: 'Prepared',
          } as Partial<T>),
        ])
      //---------------------- case: operation does not exists
      else
        operation = await this.repository.create({
          id: validated.tid,
          ...validated,
        })

      //---------------------- sending response
      if (env === 'test')
        operation = (await this.repository.show(validated.tid)) ?? operation

      return { data: AtomicTransform(operation) }
    }

    async commit(req: Request) {
      const validated = await Atomic2pcOpRefValidator(req)

      //---------------------- getting operation
      let operation = await this.repository.show(validated.tid)
      if (!operation) return { status: 202 }

      //---------------------- case: conflict
      if (operation.status !== 'Prepared')
        throw ConflictError('Commit called on non prepared operation')

      //---------------------- case: non conflict
      await Promise.all([
        this.repository.commit(operation),
        this.repository.update(validated.tid, {
          status: 'Committed',
        } as Partial<T>),
      ])

      //---------------------- sending response
      if (env === 'test')
        operation = (await this.repository.show(validated.tid)) ?? operation

      return { data: AtomicTransform(operation) }
    }

    async rollback(req: Request) {
      const validated = await Atomic2pcOpRefValidator(req)

      //---------------------- getting operation
      let operation = await this.repository.show(validated.tid)
      if (!operation) return { status: 202 }

      //---------------------- case: rollback not needed
      if (operation.status !== 'Committed') return { status: 202 }

      //---------------------- case: rollback needed
      await Promise.all([
        this.repository.rollback(operation),
        this.repository.update(validated.tid, {
          status: 'Rollbacked',
        } as Partial<T>),
      ])

      //---------------------- sending response
      if (env === 'test')
        operation = (await this.repository.show(validated.tid)) ?? operation

      return { data: AtomicTransform(operation) }
    }
  }

  return (req: Request, res: Response) => new Atomic2pcOpController(req, res)
}

export const atomic2pcOpRoutingFactory = (router: Router, prefix: string) => {
  return {
    aop: <T extends IAtomic2pcOp>(
      name: string,
      Repository: new () => Atomic2pcOpRepository<T>,
      Transform: Transform<T, data>,
      PrepareValidator: Validator
    ) => {
      const routing = routingFactory(
        router,
        atomic2pcOpControllerFactory(Repository, Transform, PrepareValidator)
      )

      return routing.subgroup()(
        routing.post(`${prefix}${name}/:tid/prepare`, 'prepare'),
        routing.put(`${prefix}${name}/:tid/commit`, 'commit'),
        routing.delete(`${prefix}${name}/:tid/rollback`, 'rollback')
      )
    },
  }
}
