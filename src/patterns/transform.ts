import * as R from 'ramda'

export type Transform<I, O> = (object: I) => O | Promise<O>

export function collection<I, O>(
  transform: Transform<I, O>,
  objects: I[]
): Promise<O[]> | O[] {
  const mapped = R.map(transform, objects)
  if (mapped[0] instanceof Promise) return Promise.all(mapped)
  else return mapped as O[]
}
