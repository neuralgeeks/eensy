/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

const Sequencer = require('@jest/test-sequencer').default

/**
 * Order:
 * - index
 * - show
 * - update
 * - store
 * - other
 * - delete
 */
const order = ['index', 'show', 'update', 'store', 'other', 'destroy']
const types = ['index', 'show', 'update', 'store', 'destroy']

function restSpecsOrder(testA, testB) {
  const getRestSpecType = (test) => {
    const name = path.basename(test.path)
    for (const restSpecType of types)
      if (name.includes(restSpecType)) return restSpecType

    return 'other'
  }

  const restSpecTypeA = getRestSpecType(testA)
  const restSpecTypeB = getRestSpecType(testB)

  return order.indexOf(restSpecTypeA) < order.indexOf(restSpecTypeB) ? -1 : 1
}

class CustomSequencer extends Sequencer {
  sort(tests) {
    return Array.from(tests).sort(restSpecsOrder)
  }
}

module.exports = CustomSequencer
