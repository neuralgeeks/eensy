import { Request, Response } from 'express'

export abstract class Controller {
  protected req: Request
  protected res: Response

  constructor(req: Request, res: Response) {
    this.req = req
    this.res = res
  }
}

export type RouteHandler = (
  req: Request,
  res: Response
) => Promise<{ status?: number; data?: unknown } | void>
