import type { Request, Response } from 'express'

import { data } from '../utils/types'

export type Validator = (req: Request, res: Response) => Promise<data>
