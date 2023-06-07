import { Job } from 'bull'
import Redlock from 'redlock'

import { _2pcJobProcessor, _2pcJobValidator } from './job'
import { data } from '../utils/types'

export const _2pcQueueOnProcess = (
  processor: _2pcJobProcessor,
  validator: _2pcJobValidator,
  redlock: Redlock
) =>
  async function (job: Job) {
    const { id, data } = job

    await processor.onJobBegins(id)

    //---------------- Aquire locks
    const locksSet = new Set([
      ...processor.requiredLocks(id, data),
      ...validator.requiredLocks(data),
    ])
    const lock = await redlock.acquire(Array.from(locksSet), 5000)

    //---------------- Validate
    let validated: data
    try {
      validated = await validator.validate(data)
    } catch (e) {
      await processor.onValidationError(id, data, e)
      await lock.release()
      return { status: 'validation rejected' }
    }

    //---------------- 2pc
    try {
      //------ preparing transactions
      const prepareOps = await Promise.allSettled(
        processor.prepare(id, validated)
      )
      for (const op of prepareOps) if (op.status === 'rejected') throw op.reason

      //------ commiting transactions
      const commitOps = await Promise.allSettled(
        processor.commit(id, validated)
      )
      for (const op of commitOps) if (op.status === 'rejected') throw op.reason
    } catch (e) {
      try {
        //------ rollback transactions
        const rollbackOps = await Promise.allSettled(
          processor.rollback(id, validated)
        )
        for (const op of rollbackOps)
          if (op.status === 'rejected') throw op.reason
      } catch (rollbackError) {
        await processor.onRollbackError(id, validated, rollbackError)
      }

      await processor.onTransactionError(id, validated, e)
      await lock.release()
      throw e // Marking job as failed
    }

    await processor.onTransactionSuccess(id, validated)
    await lock.release()
  }

export const _2pcQueueOnFailed = (processor: _2pcJobProcessor) =>
  async function (job: Job, e: unknown) {
    const { id, data } = job

    const state = await job.getState()
    if (state === 'failed') await processor.onJobCompletelyFailed(id, data)
    else await processor.onJobFailed(id, data, e)
  }
