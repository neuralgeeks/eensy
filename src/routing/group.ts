import * as R from 'ramda'

import type { Middleware, Route } from './method'

export type Group = (
  ...middleware: Middleware[]
) => (...routes: Route[]) => void

export type Subgroup = (
  ...middleware: Middleware[]
) => (...routes: Route[]) => Route

export const group: Group =
  (...middleware) =>
  (...routes) => {
    R.forEach((route) => route(...middleware), routes)
  }

export const subgroup: Subgroup =
  (...subgroupMiddleware) =>
  (...routes) =>
  (...middlewares) =>
    group(...R.concat(middlewares, subgroupMiddleware))(...routes)
