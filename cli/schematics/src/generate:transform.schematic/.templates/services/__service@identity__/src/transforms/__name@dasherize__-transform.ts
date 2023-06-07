import { <%= classify(name) %> } from '@prisma-generated/client'

export type <%= classify(name) %>WithRel = <%= classify(name) %> & {}

export default function <%= classify(name) %>Transform(object: <%= classify(name) %>WithRel) {
  return {
    id: object.id,
  }
}
