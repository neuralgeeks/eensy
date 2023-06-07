/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-duplicates */
/* eslint-disable import/order */

import { Request, Response } from 'express'

import { data } from '../utils/types'

//------------- HTTP Contracts

// Host side contract
namespace ExampleHostContract {
  export interface Controller {
    example?(
      req: Request,
      res: Response
    ): Promise<{ data: { success: boolean } }>
  }

  export namespace RequestBody {
    export interface example {
      id: string
      example: string
    }
  }
}

// Client side contract
interface ExampleClientContract {
  example?(id: string, example: string): Promise<{ success: boolean }>
}

// Only one contract is written, and looks identical to the Client Contract

//------------- Validator

import { z } from 'zod'
import * as R from 'ramda'

import { BadRequestError } from '../errors/common'

export async function ExampleValidator(req: Request) {
  const schema = z.promise(
    z.object({
      id: z.string(),
      example: z.string(),
      extra: z.boolean(),
    })
  )

  const fields = {
    ...R.pick(['id', 'example'], req.body), // R for efficiency
    extra: Math.random() > 0.5,
  }

  type RequestBody = ExampleHostContract.RequestBody.example
  const validated: RequestBody = await schema
    .parseAsync(fields)
    .catch(rethrow(BadRequestError()))

  //validated.epale = 'xd' // Type error

  return { ...validated, joao: 11 } // type safe & dynamic completetion
}

//------------- Transform

export type ExampleTransformInput = {
  example: string
  roll: boolean
} // In a real use case this will most likely be a Model type, like User

export function ExampleTransform(object: ExampleTransformInput) {
  return {
    id: 'UUID-facade-bla-bla',
    example: object.example,
    success: object.roll,
  }
}

//----------- Controllers & Contracts

import { Controller, RouteHandler } from '../patterns/controller'

class ExampleController
  extends Controller
  implements ExampleHostContract.Controller
{
  async example(req: Request) {
    const validated = await ExampleValidator(req)

    return {
      status: 202,
      data: ExampleTransform({
        example: validated.example,
        roll: Math.random() > 0.5,
      }),
    }
  }

  async demo() {
    if (Math.random() > 0.5) throw BadRequestError('random bad request')

    return { status: 202 }
  }

  async demo200Empty() {
    if (Math.random() > 0.5) throw BadRequestError('random bad request')

    return { status: 200 }
  }

  async demoNonValid() {
    if (Math.random() > 0.5) throw BadRequestError('random bad request')

    return { hola: 'pepe' }
  }

  async demoAlsoNonValid() {
    if (Math.random() > 0.5) throw BadRequestError('random bad request')

    return
  }
}

export default function controllerFactory(req: Request, res: Response) {
  return new ExampleController(req, res)
}

//------------- Example atomic Op
import {
  Atomic2pcOpRepository,
  atomic2pcOpRoutingFactory,
} from '../2pc/atomic-operation'

interface Atom {
  id: string
  status: 'Prepared' | 'Committed' | 'Rollbacked'
  element: string
}

class AtomRepository extends Atomic2pcOpRepository<Atom> {
  commit(op: Atom): Promise<void> {
    throw 'Method not implemented.'
  }

  rollback(op: Atom): Promise<void> {
    throw 'Method not implemented.'
  }

  all(): Promise<Atom[]> {
    throw 'Method not implemented.'
  }

  show(id: string): Promise<Atom> {
    throw 'Method not implemented.'
  }

  delete(id: string): Promise<Atom> {
    throw 'Method not implemented.'
  }

  update(id: string, data: Partial<Atom>): Promise<data> {
    throw 'Method not implemented.'
  }

  create(data: Atom): Promise<Atom> {
    throw 'Method not implemented.'
  }
}

function AtomTransform(object: Atom) {
  return object
}

async function AtomPrepareValidator(req: Request, res: Response) {
  return {} // Empty example
}

//------------- Routes

import { Router } from 'express'
import { routingFactory } from '../routing'
import { rethrow } from '../errors/error'

const router = Router()
const routing = routingFactory(router, controllerFactory)
const atomRouting = atomic2pcOpRoutingFactory(router, '/atomic')

routing.group()(
  routing.get('/example', 'example'),
  routing.post('/demo', 'demo'),
  routing.subgroup()(
    atomRouting.aop(
      '/addCredits',
      AtomRepository,
      AtomTransform,
      AtomPrepareValidator
    ),
    atomRouting.aop(
      '/resetCredits',
      AtomRepository,
      AtomTransform,
      AtomPrepareValidator
    )
  )
)

atomRouting.aop(
  '/withdrawCredits',
  AtomRepository,
  AtomTransform,
  AtomPrepareValidator
)()
